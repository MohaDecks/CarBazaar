import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  message: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.stack || error.message };
  }

  render() {
    if (this.state.message) {
      return (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            padding: 24,
            color: "#fecaca",
            fontSize: 13,
            background: "#111",
            minHeight: "100%",
            margin: 0,
          }}
        >
          {this.state.message}
        </pre>
      );
    }
    return this.props.children;
  }
}
