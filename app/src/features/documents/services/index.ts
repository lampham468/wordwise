/**
 * documents/services/index.ts – Main exports for document services
 * Re-exports all document-related functions from the services directory
 */

// Business logic service
export { documentsService } from './documents.service'

// Core API operations
export {
  createDocument,
  getDocument,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  documentExists
} from './documents.api'

// Query operations
export {
  searchDocuments,
  getRecentDocuments,
  getNextDocumentNumber,
  getOrphanedDocuments,
  getPopularDocuments
} from './documents.queries' 
