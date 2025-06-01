/**
 * @dev DynamoDB Service – centralised helper for all DynamoDB access
 * @notice Wraps the AWS SDK v3 DocClient commands
 * @notice Gives you strongly-typed helpers for the project + processed-data tables
 * @notice Exposes low-level CRUD helpers you can reuse elsewhere
*/
// Externals
import {
  DeleteCommand,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'
// Locals
import { 
  ddbDocClient,
  DYNAMODB_TABLE_NAMES,
} from '@/utils'
import type {
  PROJECT__DYNAMODB,
  PROCESSED_DATA__DYNAMODB,
} from '@/types'

/* ──────────────── Generic helpers ──────────────── */

export interface DynamoItem {
  id: string            // partition-key for both tables
  [key: string]: any
}

class DynamoService {
  /* -------- CRUD "raw" helpers -------- */

  /**
   * @dev Put an item into DynamoDB
   * @param table - The table name
   * @param item - The item to put
   */
  async putItem<T extends DynamoItem>(table: string, item: T): Promise<void> {
    const input: PutCommandInput = { TableName: table, Item: item }
    const command = new PutCommand(input)
    await ddbDocClient.send(command)
  }

  /**
   * @dev Get an item from DynamoDB
   * @param table - The table name
   * @param key - The key of the item
   * @returns The item
   */
  async getItem <T extends DynamoItem>(
    table: string,
    key: Record<string, any>
  ): Promise<T | undefined> {
    const input: GetCommandInput = { TableName: table, Key: key }
    const command = new GetCommand(input)
    const { Item } = await ddbDocClient.send(command)
    return Item as T | undefined
  }

  /**
   * @dev Query items from DynamoDB
   * @param table - The table name
   * @param keyCondExpr - The key condition expression
   * @param exprAttrVals - The expression attribute values
   * @param indexName - The index name
   * @param limit - The limit of items to return
   * @param scanForward - Whether to scan forward
   * @returns The items
   */
  async queryItems <T extends DynamoItem>(
    table: string,
    keyCondExpr: string,
    exprAttrVals: Record<string, any>,
    indexName?: string,
    limit?: number,
    scanForward = true
  ): Promise<T[]> {
    const input: QueryCommandInput = {
      TableName: table,
      KeyConditionExpression: keyCondExpr,
      ExpressionAttributeValues: exprAttrVals,
      ScanIndexForward: scanForward,
      ...(indexName && { IndexName: indexName }),
      ...(limit && { Limit: limit }),
    }
    const command = new QueryCommand(input)
    const { Items } = await ddbDocClient.send(command)
    return (Items || []) as T[]
  }

  /**
   * @dev Scan items from DynamoDB
   * @param table - The table name
   * @param filterExpr - The filter expression
   * @param exprAttrVals - The expression attribute values
   * @param limit - The limit of items to return
   * @returns The items
   */
  async scanItems <T extends DynamoItem>(
    table: string,
    filterExpr?: string,
    exprAttrVals?: Record<string, any>,
    limit?: number,
  ): Promise<T[]> {
    const input: ScanCommandInput = {
      TableName: table,
      ...(filterExpr && { FilterExpression: filterExpr }),
      ...(exprAttrVals && { ExpressionAttributeValues: exprAttrVals }),
      ...(limit && { Limit: limit }),
    }
    const command = new ScanCommand(input)
    const { Items } = await ddbDocClient.send(command)
    return (Items || []) as T[]
  }

  /**
   * @dev Update an item in DynamoDB
   * @param table - The table name
   * @param key - The key of the item
   * @param updateExpr - The update expression
   * @param exprAttrVals - The expression attribute values
   * @returns The item
   */
  async updateItem(
    table: string,
    key: Record<string, any>,
    updateExpr: string,
    exprAttrVals: Record<string, any>,
  ): Promise<void> {
    const input: UpdateCommandInput = {
      TableName: table,
      Key: key,
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprAttrVals,
    }
    const command = new UpdateCommand(input)
    await ddbDocClient.send(command)
  }

  /**
   * @dev Delete an item from DynamoDB
   * @param table - The table name
   * @param key - The key of the item
   * @returns The item
   */
  async deleteItem(
    table: string,
    key: Record<string, any>,
  ): Promise<void> {
    const input: DeleteCommandInput = { TableName: table, Key: key }
    const command = new DeleteCommand(input)
    await ddbDocClient.send(command)
  }

  /* -------- Project-specific helpers -------- */

  /**
   * @dev Get a project from DynamoDB
   * @param projectId - The ID of the project
   * @returns The project
   */
  async getProject(projectId: string) {
    const TableName = DYNAMODB_TABLE_NAMES.projects
    const Key = { id: projectId }
    return this.getItem<PROJECT__DYNAMODB>(TableName, Key)
  }

  /**
   * @dev Update the status of a project in DynamoDB
   * @param projectId - The ID of the project
   * @param status - The new status
   * @param emailsInc - The number of emails to increment
   */
  async updateProjectStatus(
    projectId: string,
    status: 'active' | 'inactive',
    emailsInc = 1,
  ) {
    const TableName = DYNAMODB_TABLE_NAMES.projects
    const Key = { id: projectId }
    
    const emailCount = emailsInc + 1
    const lastActivity = Date.now()

    const updateExpr = 'SET status = :status, emailCount = :emailCount, lastActivity = :lastActivity'
    const exprAttrVals = {
      ':status': status,
      ':emailCount': emailCount,
      ':lastActivity': lastActivity,
    }

    await this.updateItem(TableName, Key, updateExpr, exprAttrVals)
  }

  /* -------- Processed-data helpers -------- */

  /**
   * @dev Save processed data to DynamoDB
   * @param item - The processed data item
   */
  async saveProcessedData(item: PROCESSED_DATA__DYNAMODB) {
    const TableName = DYNAMODB_TABLE_NAMES.processedData
    await this.putItem(TableName, item)
  }

  /**
   * @dev Get processed data from DynamoDB
   * @param id - The ID of the processed data
   * @returns The processed data
   */
  async getProcessedData(id: string) {
    const TableName = DYNAMODB_TABLE_NAMES.processedData
    const Key = { id }
    return this.getItem<PROCESSED_DATA__DYNAMODB>(TableName, Key)
  }

  /**
   * @dev List processed data for a project from DynamoDB
   * @param projectId - The ID of the project
   * @param limit - The limit of items to return
   * @returns The processed data
   */
  async listProcessedDataForProject(projectId: string, limit = 10) {
    const TableName = DYNAMODB_TABLE_NAMES.processedData
    const KeyConditionExpression = 'id = :pid'
    const ExpressionAttributeValues = { ':pid': projectId }
    const Limit = limit
    const ScanForward = false // latest first

    return this.queryItems<PROCESSED_DATA__DYNAMODB>(
      TableName,
      KeyConditionExpression,
      ExpressionAttributeValues,
      undefined,
      Limit,
      ScanForward,
    )
  }
}


export const dynamoService = new DynamoService()
export default dynamoService
