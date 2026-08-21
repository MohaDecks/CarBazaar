"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Html } from "@react-three/drei";
import { Maximize2, Minimize2 } from "lucide-react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface Vehicle3DViewerProps {
  url: string;
  onError?: () => void;
}

export function Vehicle3DViewer({ url, onError }: Vehicle3DViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-vehicle items-center justify-center bg-gray-100 text-sm text-gray-500">
        3D model unavailable — showing gallery instead.
      </div>
    );
  }

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-brand-charcoal"
          : "relative aspect-vehicle overflow-hidden bg-gray-100"
      }
    >
      <Canvas
        camera={{ position: [4, 2, 4], fov: 45 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => {
            setFailed(true);
            onError?.();
          });
        }}
        onError={() => {
          setFailed(true);
          onError?.();
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <span className="text-sm text-gray-500">Loading model…</span>
            </Html>
          }
        >
          <Stage environment="city" intensity={0.6}>
            <ErrorBoundary
              onError={() => {
                setFailed(true);
                onError?.();
              }}
            >
              <Model url={url} />
            </ErrorBoundary>
          </Stage>
          <OrbitControls
            makeDefault
            enablePan
            minDistance={2}
            maxDistance={12}
          />
        </Suspense>
      </Canvas>

      <button
        type="button"
        onClick={() => setFullscreen(!fullscreen)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-brand-charcoal"
        aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {fullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/** Minimal error boundary for R3F model load failures */
import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
