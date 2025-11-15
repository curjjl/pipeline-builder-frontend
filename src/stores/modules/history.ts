import { defineStore } from 'pinia'
import type { Node, Edge } from '@antv/x6'

/**
 * Command Pattern Interface
 * Each command encapsulates a reversible operation
 */
export interface Command {
  execute(): void
  undo(): void
  redo(): void
  getDescription(): string
}

/**
 * Base abstract command class
 */
export abstract class BaseCommand implements Command {
  abstract execute(): void
  abstract undo(): void

  redo(): void {
    this.execute()
  }

  abstract getDescription(): string
}

/**
 * Add Node Command
 */
export class AddNodeCommand extends BaseCommand {
  private node: any
  private pipelineStore: any

  constructor(node: any, pipelineStore: any) {
    super()
    this.node = node
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.addNode(this.node)
  }

  undo(): void {
    this.pipelineStore.removeNode(this.node.id)
  }

  getDescription(): string {
    return `Add node: ${this.node.label || this.node.id}`
  }
}

/**
 * Delete Node Command
 */
export class DeleteNodeCommand extends BaseCommand {
  private node: any
  private relatedEdges: any[]
  private pipelineStore: any

  constructor(node: any, relatedEdges: any[], pipelineStore: any) {
    super()
    this.node = node
    this.relatedEdges = relatedEdges
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    // Remove related edges first
    this.relatedEdges.forEach(edge => {
      this.pipelineStore.removeEdge(edge.id)
    })
    this.pipelineStore.removeNode(this.node.id)
  }

  undo(): void {
    // Restore node first
    this.pipelineStore.addNode(this.node)
    // Then restore edges
    this.relatedEdges.forEach(edge => {
      this.pipelineStore.addEdge(edge)
    })
  }

  getDescription(): string {
    return `Delete node: ${this.node.label || this.node.id}`
  }
}

/**
 * Move Node Command
 */
export class MoveNodeCommand extends BaseCommand {
  private nodeId: string
  private oldPosition: { x: number; y: number }
  private newPosition: { x: number; y: number }
  private pipelineStore: any

  constructor(
    nodeId: string,
    oldPosition: { x: number; y: number },
    newPosition: { x: number; y: number },
    pipelineStore: any
  ) {
    super()
    this.nodeId = nodeId
    this.oldPosition = oldPosition
    this.newPosition = newPosition
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.updateNodePosition(this.nodeId, this.newPosition)
  }

  undo(): void {
    this.pipelineStore.updateNodePosition(this.nodeId, this.oldPosition)
  }

  getDescription(): string {
    return `Move node: ${this.nodeId}`
  }
}

/**
 * Add Edge Command
 */
export class AddEdgeCommand extends BaseCommand {
  private edge: any
  private pipelineStore: any

  constructor(edge: any, pipelineStore: any) {
    super()
    this.edge = edge
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.addEdge(this.edge)
  }

  undo(): void {
    this.pipelineStore.removeEdge(this.edge.id)
  }

  getDescription(): string {
    return `Add edge: ${this.edge.source} -> ${this.edge.target}`
  }
}

/**
 * Delete Edge Command
 */
export class DeleteEdgeCommand extends BaseCommand {
  private edge: any
  private pipelineStore: any

  constructor(edge: any, pipelineStore: any) {
    super()
    this.edge = edge
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.removeEdge(this.edge.id)
  }

  undo(): void {
    this.pipelineStore.addEdge(this.edge)
  }

  getDescription(): string {
    return `Delete edge: ${this.edge.source} -> ${this.edge.target}`
  }
}

/**
 * Update Node Config Command
 */
export class UpdateNodeConfigCommand extends BaseCommand {
  private nodeId: string
  private oldConfig: any
  private newConfig: any
  private pipelineStore: any

  constructor(
    nodeId: string,
    oldConfig: any,
    newConfig: any,
    pipelineStore: any
  ) {
    super()
    this.nodeId = nodeId
    this.oldConfig = JSON.parse(JSON.stringify(oldConfig)) // Deep copy
    this.newConfig = JSON.parse(JSON.stringify(newConfig)) // Deep copy
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.updateNodeConfig(this.nodeId, this.newConfig)
  }

  undo(): void {
    this.pipelineStore.updateNodeConfig(this.nodeId, this.oldConfig)
  }

  getDescription(): string {
    return `Update config: ${this.nodeId}`
  }
}

/**
 * Update Node Label Command
 */
export class UpdateNodeLabelCommand extends BaseCommand {
  private nodeId: string
  private oldLabel: string
  private newLabel: string
  private pipelineStore: any

  constructor(
    nodeId: string,
    oldLabel: string,
    newLabel: string,
    pipelineStore: any
  ) {
    super()
    this.nodeId = nodeId
    this.oldLabel = oldLabel
    this.newLabel = newLabel
    this.pipelineStore = pipelineStore
  }

  execute(): void {
    this.pipelineStore.updateNodeLabel(this.nodeId, this.newLabel)
  }

  undo(): void {
    this.pipelineStore.updateNodeLabel(this.nodeId, this.oldLabel)
  }

  getDescription(): string {
    return `Rename: ${this.oldLabel} -> ${this.newLabel}`
  }
}

/**
 * Batch Command - for executing multiple commands as one
 */
export class BatchCommand extends BaseCommand {
  private commands: Command[]
  private description: string

  constructor(commands: Command[], description: string) {
    super()
    this.commands = commands
    this.description = description
  }

  execute(): void {
    this.commands.forEach(cmd => cmd.execute())
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo()
    }
  }

  getDescription(): string {
    return this.description
  }
}

interface HistoryState {
  undoStack: Command[]
  redoStack: Command[]
  maxHistorySize: number
  isExecuting: boolean
}

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    undoStack: [],
    redoStack: [],
    maxHistorySize: 50, // Maximum number of undo operations to keep
    isExecuting: false // Flag to prevent recording during undo/redo
  }),

  getters: {
    canUndo: (state): boolean => {
      return state.undoStack.length > 0
    },

    canRedo: (state): boolean => {
      return state.redoStack.length > 0
    },

    undoDescription: (state): string | null => {
      if (state.undoStack.length === 0) return null
      return state.undoStack[state.undoStack.length - 1].getDescription()
    },

    redoDescription: (state): string | null => {
      if (state.redoStack.length === 0) return null
      return state.redoStack[state.redoStack.length - 1].getDescription()
    },

    historySize: (state): number => {
      return state.undoStack.length
    }
  },

  actions: {
    /**
     * Execute a command and add it to history
     */
    executeCommand(command: Command): void {
      // If we're in the middle of undo/redo, don't record
      if (this.isExecuting) {
        return
      }

      // Execute the command
      command.execute()

      // Add to undo stack
      this.undoStack.push(command)

      // Clear redo stack (can't redo after new action)
      this.redoStack = []

      // Limit history size
      if (this.undoStack.length > this.maxHistorySize) {
        this.undoStack.shift() // Remove oldest command
      }
    },

    /**
     * Undo the last command
     */
    undo(): void {
      if (!this.canUndo) {
        return
      }

      this.isExecuting = true

      try {
        const command = this.undoStack.pop()!
        command.undo()
        this.redoStack.push(command)
      } finally {
        this.isExecuting = false
      }
    },

    /**
     * Redo the last undone command
     */
    redo(): void {
      if (!this.canRedo) {
        return
      }

      this.isExecuting = true

      try {
        const command = this.redoStack.pop()!
        command.redo()
        this.undoStack.push(command)
      } finally {
        this.isExecuting = false
      }
    },

    /**
     * Clear all history
     */
    clear(): void {
      this.undoStack = []
      this.redoStack = []
    },

    /**
     * Get undo stack size
     */
    getUndoStackSize(): number {
      return this.undoStack.length
    },

    /**
     * Get redo stack size
     */
    getRedoStackSize(): number {
      return this.redoStack.length
    }
  }
})
