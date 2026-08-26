import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef } from "react";

const pyQuestTheme = EditorView.theme(
  {
    "&": {
      color: "#F4F7FB",
      backgroundColor: "#152033",
    },
    ".cm-content": {
      caretColor: "#FFD43B",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#FFD43B",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(55, 118, 171, 0.45)",
    },
    ".cm-gutters": {
      color: "#8FA4BB",
      backgroundColor: "#152033",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "rgba(255, 212, 59, 0.06)",
    },
    "&.cm-focused": {
      outline: "none",
    },
    "&.cm-editor.cm-readonly": {
      opacity: "0.72",
    },
  },
  { dark: true },
);

interface CodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled: boolean;
}

export function CodeEditor({ value, onChange, disabled }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (containerRef.current === null) return;
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          pyQuestTheme,
          EditorView.lineWrapping,
          EditorView.editable.of(!disabled),
          EditorView.contentAttributes.of({
            "aria-label": "Python code editor",
            spellcheck: "false",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [disabled]);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null || view.state.doc.toString() === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  return <div className="code-editor" ref={containerRef} />;
}
