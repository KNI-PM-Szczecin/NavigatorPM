"use client";

import EditorCanvas from "@/components/admin/EditorCanvas";
import EditorSidebar from "@/components/admin/EditorSidebar";
import EditorHeader from "@/components/admin/Header";

export default function MapEditorPage() {
  return (
    <>
      <EditorHeader />

      <div className="flex flex-1 overflow-hidden">
        <EditorCanvas />

        <EditorSidebar />
      </div>
    </>
  );
}
