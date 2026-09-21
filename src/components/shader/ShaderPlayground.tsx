import { useRef, useEffect, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import {githubDark, githubLight} from "@uiw/codemirror-theme-github"

type ShaderPlaygroundProps = {
  aspectWidth?: number;
  aspectHeight?: number;
  initialCode?: string;
}

const vertexShaderSource = `#version 300 es
in vec2 aPosition;

void main(){
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const defaultCode = `void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2 uv = fragCoord / iResolution.xy;

  fragColor = vec4(uv, 0.0, 1.0);
}`

function buildFragmentShader(userCode: string){
  return `#version 300 es

precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
out vec4 fragColor;

${userCode}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}

`
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    return {shader: null, error: "could not create shader"}
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    return {shader: null, error: err ?? "shader compilation failed"}
  }

  return {shader, error: null}
}


const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-foreground)",
    fontSize: "0.8rem",
  },

  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.7",
  },

  ".cm-content": {
    padding: "0",
    caretColor: "var(--color-accent)",
  },

  ".cm-line": {
    paddingLeft: "1rem",
    paddingRight: "1rem",
  },

  ".cm-gutters": {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-faint)",
    borderRight: "1px solid var(--color-border)",
  },

  "&.cm-focused": {
    outline: "none",
  },
})

export default function ShaderPlayground({aspectWidth = 16, aspectHeight=9, initialCode=defaultCode}: ShaderPlaygroundProps) {
  const validAspectRatio = aspectWidth > aspectHeight && aspectHeight > 0 ? `${aspectWidth}/${aspectHeight}` : "16/9"
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [code, setCode] = useState(initialCode)
  const [isDark, setIsDark] = useState(true)
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const vertexShaderRef = useRef<WebGLShader | null>(null)
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const [error, setError] = useState<string | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null)
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null)
  const visibleRef = useRef(true)

  function resetCode() {
    setCode(initialCode);
  }

  useEffect(() => {
    const html = document.documentElement
    function updateTheme() {
      setIsDark(html.dataset.theme !== "light")
    }
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-theme"]
    })
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }
    const gl = canvas.getContext("webgl2")
    if (!gl) {
      console.error("WebGL2 is not supported")
      return
    }

    glRef.current = gl

    const vertexResult = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    if (!vertexResult.shader) {
      console.error(vertexResult.error)
      return
    }
    vertexShaderRef.current = vertexResult.shader

    const vertices = new Float32Array([
      -1, -1,
      3, -1,
      -1, 3,
    ])

    const buffer = gl.createBuffer()
    if (!buffer) {
      throw new Error("could not create vertex buffer")
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    bufferRef.current = buffer

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })

    observer.observe(canvas)

    const canvasElement = canvas

    startTimeRef.current = performance.now()

    function resizecanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(canvasElement.clientWidth * dpr))
      const height = Math.max(1, Math.floor(canvasElement.clientHeight * dpr))

      if (canvasElement.width !== width || canvasElement.height !== height) {
        canvasElement.width = width
        canvasElement.height = height
      }
    }

    function render(now: number) {
      if (!visibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      const program = programRef.current
      const resolutionLocation = resolutionLocationRef.current
      const timeLocation = timeLocationRef.current

      if (program) {
        resizecanvas()

        const elapsed = (now - startTimeRef.current) / 1000

        gl?.useProgram(program)
        gl?.uniform2f(resolutionLocation, canvasElement.width, canvasElement.height)
        gl?.uniform1f(timeLocation, elapsed)

        gl?.viewport(0, 0, canvasElement.width, canvasElement.height)

        gl?.drawArrays(gl.TRIANGLES, 0, 3)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      observer.disconnect()

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (programRef.current) {
        gl.deleteProgram(programRef.current)
      }

      if (bufferRef.current) {
        gl.deleteBuffer(bufferRef.current)
      }

      if (vertexShaderRef.current) {
        gl.deleteShader(vertexShaderRef.current)
      }
    }
  },[])

  useEffect(() => {
    const gl = glRef.current
    const vertexShader = vertexShaderRef.current
    const buffer = bufferRef.current

    if (!gl || !vertexShader || !buffer) {
      return
    }

    const fragmentResult = compileShader(gl, gl.FRAGMENT_SHADER, buildFragmentShader(code))
    if (!fragmentResult.shader) {
      setError(fragmentResult.error)
      return
    }

    const fragmentShader = fragmentResult.shader
    setError(null)

    const program = gl.createProgram()

    if (!program) {
      throw new Error("could not create WebGL program")
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program)
      gl.deleteShader(fragmentShader)
      gl.deleteProgram(program)
      setError(err ?? "shader program linking failed")
      return
    }

    gl.detachShader(program, fragmentShader)
    gl.deleteShader(fragmentShader)

    const previousProgram = programRef.current
    programRef.current = program

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    const positionLocation = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    if (previousProgram) {
      gl.deleteProgram(previousProgram)
    }

    const resolutionLocation = gl.getUniformLocation(program, "iResolution")
    const timeLocation = gl.getUniformLocation(program, "iTime")

    resolutionLocationRef.current = resolutionLocation
    timeLocationRef.current = timeLocation

  }, [code])




  return (
    <div className="my-6 overflow-hidden rounded-lg border-border bg-surface">
      <div className="relative w-full bg-black" style={{ aspectRatio: validAspectRatio }}>
        <div className="pointer-events-none absolute top-0 left-0 z-10 px-3 py-2 font-mono text-xs text-white/50 uppercase">
          OUTPUT
        </div>
        <canvas className="absolute inset-0 block h-full w-full" ref={canvasRef}/>
      </div>

      <div className="border-t border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 uppercase">
          <span className="font-mono text-xs text-muted">
            fragment shader
          </span>

          <button
            type="button"
            onClick={resetCode}
            className="cursor-pointer font-mono text-xs text-muted transition-colors hover:text-foreground uppercase"
          >
            reset
          </button>
        </div>

        <div className="overflow-hidden">
          <CodeMirror
            value={code}
            extensions={[cpp(), editorTheme, EditorView.lineWrapping]}
            onChange={(value) => setCode(value)}
            theme={isDark ? githubDark : githubLight}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: false,
              autocompletion: false,
              bracketMatching: true,
              closeBrackets: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              highlightSelectionMatches: false,
            }}
          />
        </div>

        {error && (
          <div className="border-t border-border bg-red-500/5">
            <div className="px-3 pt-2 font-mono text-[0.65rem] font-bold text-red-500 uppercase">
              shader error
            </div>
            <pre className="m-0 max-h-40 overflow-auto p-3 pt-1 font-mono text-xs whitespace-pre-wrap text-red-500">
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
