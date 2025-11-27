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
          tagName: 'g',
          selector: 'labelGroup',
          children: [
            {
              tagName: 'text',
              selector: 'label'
            },
            {
              tagName: 'title',
              selector: 'labelTitle'
            }
          ]
        },
        {
          tagName: 'g',
          selector: 'metaGroup',
          children: [
            {
              tagName: 'text',
              selector: 'meta'
            },
            {
              tagName: 'title',
              selector: 'metaTitle'
            }
          ]
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
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 20,
            ellipsis: true
          }
        },
        labelTitle: {
          text: 'Dataset'
        },
        meta: {
          text: '0 columns',
          refX: 52,
          refY: 46,
          fill: '#667085',
          fontSize: 12,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 16,
            ellipsis: true
          }
        },
        metaTitle: {
          text: '0 columns'
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
          out: {
            position: { name: 'right', args: { y: 36 } },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示，提升新手体验
              }
            }
          }
        },
        items: [
          { group: 'out', id: 'port-out' }
        ]
      }
    },
    true
  )
}

/**
 * Register Transform Node - Palantir Official Style
 */
export function registerTransformNode() {
  Graph.registerNode(
    'transform-node',
    {
      inherit: 'rect',
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
          tagName: 'g',
          selector: 'labelGroup',
          children: [
            {
              tagName: 'text',
              selector: 'label'
            },
            {
              tagName: 'title',
              selector: 'labelTitle'
            }
          ]
        },
        {
          tagName: 'g',
          selector: 'metaGroup',
          children: [
            {
              tagName: 'text',
              selector: 'meta'
            },
            {
              tagName: 'title',
              selector: 'metaTitle'
            }
          ]
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
          'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjIgM0gyQzAuOSAzIDAgMy45IDAgNVYxOUMwIDIwLjEgMC45IDIxIDIgMjFIMjJDMjMuMSAyMSAyNCAyMC4xIDI0IDE5VjVDMjQgMy45IDIzLjEgMyAyMiAzWiIgc3Ryb2tlPSIjMTU3MEVGIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8bGluZSB4MT0iMyIgeTE9IjkiIHgyPSIyMSIgeTI9IjkiIHN0cm9rZT0iIzE1NzBFRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjMiIHkxPSIxNSIgeDI9IjIxIiB5Mj0iMTUiIHN0cm9rZT0iIzE1NzBFRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
          width: 20,
          height: 20,
          x: 18,
          y: 18
        },
        label: {
          text: 'Transform',
          refX: 52,
          refY: 22,
          fill: '#101828',
          fontSize: 14,
          fontWeight: 600,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 20,
            ellipsis: true
          }
        },
        labelTitle: {
          text: 'Transform'
        },
        meta: {
          text: 'Not configured',
          refX: 52,
          refY: 46,
          fill: '#667085',
          fontSize: 12,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 16,
            ellipsis: true
          }
        },
        metaTitle: {
          text: 'Not configured'
        }
      },
      ports: {
        groups: {
          in: {
            position: { name: 'left', args: { y: 34 } },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示
              }
            }
          },
          out: {
            position: { name: 'right', args: { y: 34 } },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示
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
 * Register Join Node - Palantir Official Style
 */
export function registerJoinNode() {
  Graph.registerNode(
    'join-node',
    {
      inherit: 'rect',
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
          tagName: 'g',
          selector: 'labelGroup',
          children: [
            {
              tagName: 'text',
              selector: 'label'
            },
            {
              tagName: 'title',
              selector: 'labelTitle'
            }
          ]
        },
        {
          tagName: 'g',
          selector: 'metaGroup',
          children: [
            {
              tagName: 'text',
              selector: 'meta'
            },
            {
              tagName: 'title',
              selector: 'metaTitle'
            }
          ]
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
          fill: '#FEF3C7',
          rx: 4,
          ry: 4
        },
        icon: {
          'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNCIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI0IiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxsaW5lIHgxPSIxMSIgeTE9IjExIiB4Mj0iMTMiIHkyPSIxMyIgc3Ryb2tlPSIjRjU5RTBCIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
          width: 20,
          height: 20,
          x: 18,
          y: 18
        },
        label: {
          text: 'Join',
          refX: 52,
          refY: 22,
          fill: '#101828',
          fontSize: 14,
          fontWeight: 600,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 20,
            ellipsis: true
          }
        },
        labelTitle: {
          text: 'Join'
        },
        meta: {
          text: 'Inner join',
          refX: 52,
          refY: 46,
          fill: '#667085',
          fontSize: 12,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 16,
            ellipsis: true
          }
        },
        metaTitle: {
          text: 'Inner join'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'left',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示
              }
            }
          },
          out: {
            position: { name: 'right', args: { y: 36 } },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'port-in-1', args: { y: '35%' } },
          { group: 'in', id: 'port-in-2', args: { y: '65%' } },
          { group: 'out', id: 'port-out' }
        ]
      }
    },
    true
  )
}

/**
 * Register Output Node - Palantir Official Style
 */
export function registerOutputNode() {
  Graph.registerNode(
    'output-node',
    {
      inherit: 'rect',
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
          tagName: 'g',
          selector: 'labelGroup',
          children: [
            {
              tagName: 'text',
              selector: 'label'
            },
            {
              tagName: 'title',
              selector: 'labelTitle'
            }
          ]
        },
        {
          tagName: 'g',
          selector: 'metaGroup',
          children: [
            {
              tagName: 'text',
              selector: 'meta'
            },
            {
              tagName: 'title',
              selector: 'metaTitle'
            }
          ]
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
          fill: '#F3E8FF',
          rx: 4,
          ry: 4
        },
        icon: {
          'xlink:href': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMyAzSDIxVjE3SDMiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTcgMjFMMTcgMjEiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMTIgMTdWMjEiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==',
          width: 20,
          height: 20,
          x: 18,
          y: 18
        },
        label: {
          text: 'Output',
          refX: 52,
          refY: 22,
          fill: '#101828',
          fontSize: 14,
          fontWeight: 600,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 20,
            ellipsis: true
          }
        },
        labelTitle: {
          text: 'Output'
        },
        meta: {
          text: 'Save to dataset',
          refX: 52,
          refY: 46,
          fill: '#667085',
          fontSize: 12,
          'text-anchor': 'start',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          textWrap: {
            width: 170,
            height: 16,
            ellipsis: true
          }
        },
        metaTitle: {
          text: 'Save to dataset'
        }
      },
      ports: {
        groups: {
          in: {
            position: { name: 'left', args: { y: 36 } },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#5F6368',
                strokeWidth: 2,
                fill: '#FFFFFF',
                opacity: 0.3  // ✅ 优化：默认半透明显示
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
