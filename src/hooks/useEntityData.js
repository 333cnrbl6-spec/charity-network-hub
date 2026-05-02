import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Utility hook to fetch entity data with optional filtering.
 * Enforces the direct-entity pattern (no backend functions for data access).
 * 
 * @param {string} entityName - Entity name (e.g., 'Campaign', 'Donor')
 * @param {object} filter - Optional filter object (e.g., { charity_id: charityId })
 * @param {object} options - React Query options (queryKey, enabled, etc.)
 * @returns {object} { data, isLoading, error, isError }
 * 
 * @example
 * const { data: campaigns } = useEntityData('Campaign', { charity_id: charityId });
 * const { data: donors } = useEntityData('Donor', { charity_id: charityId }, { enabled: !!charityId });
 */
export function useEntityData(entityName, filter = {}, options = {}) {
  const queryKey = [entityName, filter];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const entity = base44.entities[entityName];
        if (!entity) {
          throw new Error(`Entity ${entityName} not found in Base44 SDK`);
        }

        // Use filter method if filters provided, otherwise list all
        const hasFilters = Object.keys(filter).length > 0;
        return hasFilters ? await entity.filter(filter) : await entity.list();
      } catch (err) {
        console.error(`Failed to fetch ${entityName}:`, err);
        throw err;
      }
    },
    ...options
  });
}

/**
 * Create or update an entity record.
 * 
 * @param {string} entityName - Entity name
 * @param {string|null} id - Record ID (null for create, string for update)
 * @param {object} data - Data to create/update
 * @returns {Promise}
 * 
 * @example
 * const created = await saveEntity('Campaign', null, { title: 'New Campaign', charity_id: 'xyz' });
 * const updated = await saveEntity('Campaign', campaignId, { status: 'active' });
 */
export async function saveEntity(entityName, id, data) {
  try {
    const entity = base44.entities[entityName];
    if (!entity) {
      throw new Error(`Entity ${entityName} not found in Base44 SDK`);
    }

    if (id) {
      return await entity.update(id, data);
    } else {
      return await entity.create(data);
    }
  } catch (err) {
    console.error(`Failed to save ${entityName}:`, err);
    throw err;
  }
}

/**
 * Delete an entity record.
 * 
 * @param {string} entityName - Entity name
 * @param {string} id - Record ID
 * @returns {Promise}
 * 
 * @example
 * await deleteEntity('Campaign', campaignId);
 */
export async function deleteEntity(entityName, id) {
  try {
    const entity = base44.entities[entityName];
    if (!entity) {
      throw new Error(`Entity ${entityName} not found in Base44 SDK`);
    }

    return await entity.delete(id);
  } catch (err) {
    console.error(`Failed to delete ${entityName}:`, err);
    throw err;
  }
}