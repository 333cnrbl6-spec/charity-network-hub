# Database Failover & Recovery Procedures

## Overview

Database replication is configured with:
- **Primary:** Production database (active writes)
- **Replica:** Standby database (read-only, continuous replication)
- **Backup:** Daily encrypted snapshot to cloud storage

---

## Automatic Failover (Recommended)

### How It Works
1. Health check probes primary every 10 seconds
2. If primary down for 30 seconds: replica promoted automatically
3. Application connection pool switches to replica (now primary)
4. Alerts fire to ops team

### What You Do
1. Investigate why primary failed
2. Restore primary database
3. Resync replica from new primary
4. Update documentation

### RTO (Recovery Time Objective): 2-3 minutes
### RPO (Recovery Point Objective): < 30 seconds

---

## Manual Failover (Emergency Only)

Use this if automatic failover fails or you need manual control.

### Prerequisites
- SSH access to database servers
- psql CLI installed
- Database credentials

### Steps

**1. Check replica status**
```bash
ssh replica-db-01.internal
psql -U admin -d charityhub
SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();
```

**2. Stop replication (if needed)**
```sql
SELECT pg_wal_replay_pause();
```

**3. Promote replica to primary**
```bash
pg_ctl promote -D /var/lib/postgresql/data
-- or via SQL:
SELECT pg_promote();
```

**4. Update application configuration**
```
Update connection string in environment:
POSTGRES_URL = postgres://admin:pass@new-primary-ip:5432/charityhub
Redeploy application (or just restart container)
```

**5. Verify replica → primary**
```bash
psql -U admin -d charityhub
SHOW server_version;
SELECT now();
```

**6. Restore original primary**
Once primary is healthy:
```bash
ssh primary-db-01.internal
pg_ctl start
-- Wait for startup
psql -U admin -d charityhub
-- Run: SELECT pg_create_physical_replication_slot('replica_slot');
```

**7. Resync replica**
```bash
ssh replica-db-01.internal
pg_rewind --target-pgdata=/var/lib/postgresql/data --source-server="host=primary-ip user=admin password=xxx"
pg_ctl start
```

---

## Restore from Backup

Use this if both primary and replica are corrupted/lost.

### Prerequisites
- Access to backup storage (AWS S3, GCS)
- Backup encryption key
- Database restoration privilege

### Steps

**1. Assess damage**
```bash
# Can you connect to primary/replica?
psql -U admin -h primary-ip -d charityhub
psql -U admin -h replica-ip -d charityhub

# If yes to either: don't restore from backup, use failover instead
```

**2. Find latest good backup**
```bash
aws s3 ls s3://charityhub-backups/ --recursive --sort=date --reverse | head -20

# Look for backup from before the incident
# Example: backup-2026-05-02T14-00-00.sql.gz.enc
```

**3. Stop application**
```bash
# Prevent writes during restore
kubectl scale deployment charityhub-api --replicas=0
```

**4. Restore database**
```bash
# Download backup
aws s3 cp s3://charityhub-backups/backup-2026-05-02T14-00-00.sql.gz.enc ./backup.sql.gz.enc

# Decrypt
openssl enc -aes-256-cbc -d -in backup.sql.gz.enc -out backup.sql.gz -k $BACKUP_KEY

# Decompress
gunzip backup.sql.gz

# Drop and recreate database (DESTRUCTIVE)
psql -U admin -h primary-ip -c "DROP DATABASE charityhub;"
psql -U admin -h primary-ip -c "CREATE DATABASE charityhub;"

# Restore
psql -U admin -h primary-ip -d charityhub < backup.sql

# Restore takes time - monitor progress
```

**5. Verify restoration**
```bash
psql -U admin -h primary-ip -d charityhub
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM donations;
SELECT COUNT(*) FROM campaigns;
-- Verify counts match expectations
```

**6. Resync replica**
```bash
# From primary:
psql -U admin -d charityhub
SELECT pg_create_physical_replication_slot('replica_slot');

# From replica:
pg_rewind --target-pgdata=/var/lib/postgresql/data --source-server="host=primary-ip user=admin password=xxx"
pg_ctl start
```

**7. Start application**
```bash
kubectl scale deployment charityhub-api --replicas=3
```

### Data Loss

Restoring from backup means losing data between backup time and incident.

**Example:** Backup at 2 PM, incident at 3 PM
- 1 hour of donations lost
- 1 hour of signups lost
- You'll need to notify affected customers

**Mitigation:**
- Backup every 1 hour (not daily)
- Maintain transaction log for point-in-time recovery
- Contact affected donors to re-process their donations

---

## Transaction Log Recovery (Advanced)

If you need to recover to a specific point in time (not just latest backup):

```bash
# Point-in-time recovery (PITR)
# Restore from 2 PM backup, then replay logs until 2:45 PM
psql -U admin -d charityhub -c "recovery_target_time = '2026-05-02 14:45:00'"
```

This requires transaction logs to be archived separately (not included in standard backup).

---

## Testing Failover (Monthly)

Don't wait for a real disaster to test failover.

### Drill Procedure
1. **Schedule:** First Tuesday of month, 8 PM UTC
2. **Duration:** 1 hour
3. **Participants:** DBA, Ops lead, Backend lead
4. **Process:**
   - Stop primary database (simulate failure)
   - Observe automatic failover
   - Verify application still works
   - Restore primary and resync
5. **Document:** Any issues, any improvements to procedure

### Success Criteria
- Failover completes in < 5 minutes
- Zero data loss
- Application continues without interruption
- All monitoring alerts fire correctly

---

## Monitoring & Alerts

### What to Monitor
```
SELECT
  slot_name,
  restart_lsn,
  confirmed_flush_lsn
FROM pg_replication_slots;
```

**Alert if:**
- Replication lag > 10 seconds (check replica LSN)
- Disk space < 10% (backups can't proceed)
- Backup job fails (check cron logs)

### Backup Job Status
```bash
# Check last backup
ls -la /var/lib/postgresql/backups/ | tail -5

# Check backup size (should be ~1-2 GB)
du -sh /var/lib/postgresql/backups/

# Verify encryption
openssl enc -aes-256-cbc -d -in backup.sql.gz.enc -out /dev/null
```

---

## Post-Incident Checklist

After any failover/restore:

- [ ] Update DNS/load balancer to point to correct primary
- [ ] Verify application can connect
- [ ] Run smoke tests (signup, donation, report)
- [ ] Check backup job completed successfully
- [ ] Document incident: what failed, how long down, root cause
- [ ] Schedule post-mortem (within 24 hours)
- [ ] Update this runbook if procedures changed

---

## Emergency Contacts

- **Database Admin:** [name] [phone]
- **AWS Support:** Account ID [xxx]
- **Backup Provider:** [service] ticket #[xxx]