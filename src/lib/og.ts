import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

// ponytail: process.cwd() is project root during astro build; import.meta.url shifts after bundling
const fontBuf = readFileSync(resolve(process.cwd(), 'src/assets/fonts/UDEVGothicHSLG-Regular.ttf'))
// ponytail: sliced to own ArrayBuffer to avoid pool offset issues
const fontData = fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength) as ArrayBuffer

export const renderOgImage = async (title: string): Promise<Uint8Array> => {
  const svg = await satori(
    {
      type: 'div',
      key: null,
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#0f172a',
          padding: '72px 80px',
          gap: '16px',
        },
        children: [
          {
            type: 'span',
            key: null,
            props: {
              style: {
                fontSize: 20,
                color: '#475569',
                fontFamily: 'UDEVGothic',
                letterSpacing: '0.05em',
              },
              children: 'Portfoliooo',
            },
          },
          {
            type: 'div',
            key: null,
            props: {
              style: {
                fontSize: 54,
                color: '#f1f5f9',
                fontFamily: 'UDEVGothic',
                lineHeight: 1.3,
                fontWeight: 400,
              },
              children: title,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'UDEVGothic',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  return resvg.render().asPng()
}
