
import {
  convertEntityFromGRPC,
  getDecimalFromGRPC
} from '@adempiere/grpc-api/lib/convertBaseDataType';

export function convertEntitiesListFromGRPC (entitiesList) {
  return {
    record_count: entitiesList.getRecordCount(),
    next_page_token: entitiesList.getNextPageToken(),
    records: entitiesList.getRecordsList().map(entity => {
      return convertEntityFromGRPC(entity);
    })
  }
}

// Convert resourtce type from gRPC to JSON
export function convertResourceType (resourceType) {
  if (resourceType) {
    return {
      id: resourceType.getId(),
      uuid: resourceType.getUuid(),
      value: resourceType.getValue(),
      name: resourceType.getName(),
      description: resourceType.getDescription()
    }
  }
  return undefined;
}

// Convert resourtce from gRPC to JSON
export function convertResource (resource) {
  if (resource) {
    return {
      id: resource.getId(),
      uuid: resource.getUuid(),
      name: resource.getName(),
      resource_type: convertResourceType(
        resource.getResourceType()
      )
    }
  }
  return undefined;
}

// Convert resourtce assignment from gRPC to JSON
export function convertResourceAssignment (resourceAssignment) {
  if (resourceAssignment) {
    return {
      id: resourceAssignment.getId(),
      uuid: resourceAssignment.getUuid(),
      resource: convertResource(
        resourceAssignment.getResource()
      ),
      name: resourceAssignment.getName(),
      description: resourceAssignment.getDescription(),
      assign_date_from: resourceAssignment.getAssignDateFrom(),
      assign_date_to: resourceAssignment.getAssignDateTo(),
      is_confirmed: resourceAssignment.getIsConfirmed(),
      quantity: getDecimalFromGRPC(resourceAssignment.getQuantity())
    }
  }
  return undefined;
}
