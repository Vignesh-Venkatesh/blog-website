import { useRef, useEffect } from "react";


type ShaderPlaygroundProps = {
  aspectWidth?: number;
  aspectHeight?: number;
}

const vertexShaderSource = `#version 300 es
in vec2 aPosition;

void main(){
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 fragColor;

void main(){
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error("could not create shader")
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(err ?? "shader compilation failed")
  }

  return shader
}

export default function ShaderPlayground({aspectWidth = 16, aspectHeight=9}: ShaderPlaygroundProps) {
  const validAspectRatio = aspectWidth > aspectHeight && aspectHeight > 0 ? `${aspectWidth}/${aspectHeight}` : "16/9"
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2");

    if (!gl) {
      console.error("WebGL2 is not supported")
      return
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = gl.createProgram()

    if (!program) {
      throw new Error("could not create WebGL program")
    }

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program)
      throw new Error(err ?? "shader program linking failed")
    }

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

    const positionLocation = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    gl.viewport(0, 0, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    console.log("WebGL2 context created:", gl)
  }, [])

  return (
    <div className="my-6 overflow-hidden rounded-lg border-border bg-surface">
      <div className="relative w-full bg-black" style={{aspectRatio: validAspectRatio}}>
        <canvas className="absolute inset-0 block h-full w-full" ref={canvasRef}/>
      </div>

      <div className="border-t border-border bg-surface">
        FRAGMENT SHADER
      </div>
    </div>
  )
}
