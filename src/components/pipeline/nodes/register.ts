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
      inherit: 'rect',
      width: 180,
      height: 72,
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
          ry: 6
        },
        icon: {
          x: 12,
          y: 12,
          width: 20,
          height: 20,
          xlinkHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMyA2QzMgNC4zNDMxNSA0LjM0MzE1IDMgNiAzSDE4QzE5LjY1NjkgMyAyMSA0LjM0MzE1IDIxIDZWMThDMTkuNjU2OSAxOCAxOCAxOS42NTY5IDE4IDIxSDZDNC4zNDMxNSAyMSAzIDE5LjY1NjkgMyAxOFY2WiIgc3Ryb2tlPSIjNDI4NUY0IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8bGluZSB4MT0iMyIgeTE9IjkiIHgyPSIyMSIgeTI9IjkiIHN0cm9rZT0iIzQyODVGNCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjMiIHkxPSIxMyIgeDI9IjIxIiB5Mj0iMTMiIHN0cm9rZT0iIzQyODVGNCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjkiIHkxPSIzIiB4Mj0iOSIgeTI9IjIxIiBzdHJva2U9IiM0Mjg1RjQiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4='
        },
        label: {
          x: 12,
          y: 40,
          fontSize: 14,
          fontWeight: 500,
          fill: '#212121',
          text: 'Dataset',
          textAnchor: 'start',
          textVerticalAnchor: 'middle'
        },
        meta: {
          x: 12,
          y: 58,
          fontSize: 12,
          fill: '#5F6368',
          text: '0 columns',
          textAnchor: 'start',
          textVerticalAnchor: 'middle'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }
            }
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 2,
                fill: '#FFFFFF'
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
          ry: 6
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
          y: 12,
          width: 18,
          height: 18,
          xlinkHref: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNyA4TDMgMTJMNyAxNiIgc3Ryb2tlPSIjOTMzNEU2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0xNyA4TDIxIDEyTDE3IDE2IiBzdHJva2U9IiM5MzM0RTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgPHBhdGggZD0iTTE0IDRMMTAgMjAiIHN0cm9rZT0iIzkzMzRFNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
        },
        label: {
          x: 40,
          y: 22,
          fontSize: 14,
          fontWeight: 500,
          fill: '#212121',
          text: 'Transform',
          textAnchor: 'start',
          textVerticalAnchor: 'middle'
        },
        meta: {
          x: 40,
          y: 38,
          fontSize: 12,
          fill: '#5F6368',
          text: '0 transformations',
          textAnchor: 'start',
          textVerticalAnchor: 'middle'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }
            }
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#98A2B3',
                strokeWidth: 2,
                fill: '#FFFFFF'
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
