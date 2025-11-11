/**
 * Custom node registration for AntV X6
 */
import { Graph } from '@antv/x6'

/**
 * Register Dataset Node
 */
export function registerDatasetNode() {
  Graph.registerNode(
    'dataset-node',
    {
      width: 240,
      height: 72,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'rect',
          selector: 'icon-bg'
        },
        {
          tagName: 'image',
          selector: 'icon'
        },
        {
          tagName: 'text',
          selector: 'label'
        },
        {
          tagName: 'text',
          selector: 'meta'
        },
        {
          tagName: 'circle',
          selector: 'action-btn'
        }
      ],
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#D0D5DD',
          fill: '#FFFFFF',
          refWidth: 1,
          refHeight: 1,
          rx: 6,
          ry: 6,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 1,
              blur: 4,
              color: 'rgba(16, 24, 40, 0.1)'
            }
          }
        },
        'icon-bg': {
          x: 12,
          y: 12,
          width: 32,
          height: 32,
          fill: '#EFF8FF',
          rx: 4,
          ry: 4
        },
        icon: {
          'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIzIiB5PSI0IiB3aWR0aD0iMTgiIGhlaWdodD0iMTYiIHJ4PSIyIiBzdHJva2U9IiMxNTcwRUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHgxPSIzIiB5MT0iOSIgeDI9IjIxIiB5Mj0iOSIgc3Ryb2tlPSIjMTU3MEVGIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8bGluZSB4MT0iMyIgeTE9IjE0IiB4Mj0iMjEiIHkyPSIxNCIgc3Ryb2tlPSIjMTU3MEVGIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8bGluZSB4MT0iOSIgeTE9IjQiIHgyPSI5IiB5Mj0iMjAiIHN0cm9rZT0iIzE1NzBFRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
          width: 20,
          height: 20,
          x: 18,
          y: 18
        },
        label: {
          text: 'Dataset',
          refX: 52,
          refY: 22,
          fill: '#101828',
          fontSize: 14,
          fontWeight: 600,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        meta: {
          text: '0 columns',
          refX: 52,
          refY: 46,
          fill: '#667085',
          fontSize: 12,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        'action-btn': {
          refCx: 220,
          refCy: 18,
          r: 8,
          fill: '#F9FAFB',
          stroke: '#D0D5DD',
          strokeWidth: 1,
          cursor: 'pointer'
        }
      },
      ports: {
        groups: {
          in: {
            position: { name: 'left', args: { y: 36 } },
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 1.5,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          },
          out: {
            position: { name: 'right', args: { y: 36 } },
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 1.5,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'port-in' },
          { group: 'out', id: 'port-out' }
        ]
      }
    },
    true
  )
}

/**
 * Register Transform Node
 */
export function registerTransformNode() {
  Graph.registerNode(
    'transform-node',
    {
      inherit: 'rect',
      width: 220,
      height: 56,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'rect',
          selector: 'left-bar'
        },
        {
          tagName: 'image',
          selector: 'icon'
        },
        {
          tagName: 'text',
          selector: 'label'
        },
        {
          tagName: 'text',
          selector: 'meta'
        }
      ],
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#D0D5DD',
          fill: '#FFFFFF',
          rx: 6,
          ry: 6,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 1,
              blur: 3,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        'left-bar': {
          width: 3,
          height: 56,
          x: 0,
          y: 0,
          fill: '#9334E6',
          rx: 6
        },
        icon: {
          x: 15,
          y: 18,
          width: 18,
          height: 18,
          xlinkHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNyA4TDMgMTJMNyAxNiIgc3Ryb2tlPSIjOTMzNEU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0xNyA4TDIxIDEyTDE3IDE2IiBzdHJva2U9IiM5MzM0RTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTE0IDRMMTAgMjAiIHN0cm9rZT0iIzkzMzRFNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
        },
        label: {
          x: 40,
          y: 21,
          fontSize: 13,
          fontWeight: 500,
          fill: '#212121',
          text: 'Transform',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        meta: {
          x: 40,
          y: 36,
          fontSize: 11,
          fill: '#5F6368',
          text: '0 transformations',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden' // 默认隐藏
                }
              }
            }
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden' // 默认隐藏
                }
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'port-in' },
          { group: 'out', id: 'port-out' }
        ]
      }
    },
    true
  )
}

/**
 * Register Join Node
 */
export function registerJoinNode() {
  Graph.registerNode(
    'join-node',
    {
      inherit: 'rect',
      width: 200,
      height: 64,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'rect',
          selector: 'left-bar'
        },
        {
          tagName: 'image',
          selector: 'icon'
        },
        {
          tagName: 'text',
          selector: 'label'
        },
        {
          tagName: 'text',
          selector: 'meta'
        }
      ],
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#D0D5DD',
          fill: '#FFFFFF',
          rx: 6,
          ry: 6,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 1,
              blur: 3,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        'left-bar': {
          width: 3,
          height: 64,
          x: 0,
          y: 0,
          fill: '#F59E0B',
          rx: 6
        },
        icon: {
          x: 15,
          y: 22,
          width: 18,
          height: 18,
          xlinkHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNCIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI0IiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHgxPSIxMSIgeTE9IjExIiB4Mj0iMTMiIHkyPSIxMyIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+'
        },
        label: {
          x: 40,
          y: 24,
          fontSize: 13,
          fontWeight: 500,
          fill: '#212121',
          text: 'Join',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        meta: {
          x: 40,
          y: 40,
          fontSize: 11,
          fill: '#5F6368',
          text: 'Inner Join',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'port-in-1', args: { x: '30%' } },
          { group: 'in', id: 'port-in-2', args: { x: '70%' } },
          { group: 'out', id: 'port-out' }
        ]
      }
    },
    true
  )
}

/**
 * Register Output Node
 */
export function registerOutputNode() {
  Graph.registerNode(
    'output-node',
    {
      inherit: 'rect',
      width: 180,
      height: 64,
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'image',
          selector: 'icon'
        },
        {
          tagName: 'text',
          selector: 'label'
        },
        {
          tagName: 'text',
          selector: 'meta'
        }
      ],
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#D0D5DD',
          fill: '#FFFFFF',
          rx: 6,
          ry: 6,
          filter: {
            name: 'dropShadow',
            args: {
              dx: 0,
              dy: 1,
              blur: 3,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        icon: {
          x: 12,
          y: 20,
          width: 20,
          height: 20,
          xlinkHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMyAzSDIxVjE3SDMiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTcgMjFMMTcgMjEiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMTIgMTdWMjEiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg=='
        },
        label: {
          x: 38,
          y: 26,
          fontSize: 13,
          fontWeight: 500,
          fill: '#212121',
          text: 'Output',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        meta: {
          x: 38,
          y: 42,
          fontSize: 11,
          fill: '#5F6368',
          text: 'Save to dataset',
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 5,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                style: {
                  visibility: 'hidden'
                }
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'port-in' }
        ]
      }
    },
    true
  )
}

/**
 * Get node color based on type
 */
export function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    dataset: '#4285F4',
    transform: '#9334E6',
    join: '#F59E0B',
    filter: '#10B981',
    aggregate: '#EF4444',
    output: '#8B5CF6'
  }
  return colors[type] || '#98A2B3'
}
