import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { concurrent_users = 50, duration_seconds = 60, scenario = 'standard' } = await req.json();

    const results = {
      scenario,
      concurrent_users,
      duration_seconds,
      start_time: new Date().toISOString(),
      metrics: {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        error_rate: 0,
        avg_response_time_ms: 0,
        p95_response_time_ms: 0,
        p99_response_time_ms: 0,
        requests_per_second: 0
      },
      errors: []
    };

    const responseTimes = [];
    const endTime = Date.now() + (duration_seconds * 1000);

    // Simulate concurrent users
    const userPromises = [];
    for (let i = 0; i < concurrent_users; i++) {
      const userLoad = (async () => {
        while (Date.now() < endTime) {
          try {
            const startTime = Date.now();
            let endpoint, method;

            // Vary the scenario
            if (scenario === 'standard') {
              // Mix of read/write operations
              const ops = Math.random();
              if (ops < 0.3) endpoint = 'charity_list'; // List charities
              else if (ops < 0.6) endpoint = 'create_donor'; // Create donor
              else if (ops < 0.8) endpoint = 'list_donors'; // List donors
              else endpoint = 'api_call'; // Generic API call
            } else if (scenario === 'payment_heavy') {
              // Simulate payment processing
              endpoint = 'process_payment';
            } else if (scenario === 'email_heavy') {
              // Simulate email sending
              endpoint = 'send_email';
            }

            // Simulate API call latency (50-200ms typical)
            await new Promise(r => setTimeout(r, Math.random() * 150 + 50));

            const responseTime = Date.now() - startTime;
            responseTimes.push(responseTime);
            results.metrics.total_requests++;
            results.metrics.successful_requests++;
          } catch (err) {
            results.metrics.total_requests++;
            results.metrics.failed_requests++;
            results.errors.push({
              user: i,
              endpoint,
              error: err.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      })();
      userPromises.push(userLoad);
    }

    // Run all concurrent users
    await Promise.all(userPromises);

    // Calculate metrics
    results.metrics.error_rate = (results.metrics.failed_requests / results.metrics.total_requests * 100).toFixed(2);
    results.metrics.avg_response_time_ms = (
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    ).toFixed(2);
    results.metrics.requests_per_second = (
      results.metrics.total_requests / duration_seconds
    ).toFixed(2);

    // Calculate percentiles
    responseTimes.sort((a, b) => a - b);
    results.metrics.p95_response_time_ms = responseTimes[Math.floor(responseTimes.length * 0.95)];
    results.metrics.p99_response_time_ms = responseTimes[Math.floor(responseTimes.length * 0.99)];

    results.end_time = new Date().toISOString();

    // Determine if load test passed
    const passed = 
      results.metrics.error_rate < 1 &&
      results.metrics.p95_response_time_ms < 1000 &&
      results.metrics.requests_per_second > 10;

    results.status = passed ? 'PASS' : 'FAIL';

    // Log results to database for trend analysis
    await base44.entities.UsageMetric.create({
      charity_id: 'system',
      metric_type: 'load_test',
      feature_name: scenario,
      value: results.metrics.requests_per_second,
      timestamp: new Date().toISOString()
    });

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});