import React, { useState } from 'react';
import { ResearchNote, ResearchItem } from '../types/research';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Check,
  Link,
  BookOpen,
  Sparkles,
  Search,
  Tag,
  Calendar,
} from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface NotesViewProps {
  notes: ResearchNote[];
  papers: ResearchItem[];
  onSaveNote: (note: ResearchNote) => void;
  onDeleteNote: (id: string) => void;
  onSelectPaper: (paper: ResearchItem) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  papers,
  onSaveNote,
  onDeleteNote,
  onSelectPaper,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [filterType, setFilterType] = useState<'all' | 'paper' | 'general' | 'synthesis'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Active note state for editing
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const [editTitle, setEditTitle] = useState(activeNote?.title || '');
  const [editContent, setEditContent] = useState(activeNote?.content || '');
  const [editType, setEditType] = useState<'paper' | 'general' | 'synthesis'>(activeNote?.type || 'general');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(activeNote?.paperIds || []);

  const filteredNotes = notes.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectNote = (note: ResearchNote) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditType(note.type);
    setSelectedPaperIds(note.paperIds || []);
    setIsEditing(false);
  };

  const handleCreateNew = (type: 'paper' | 'general' | 'synthesis') => {
    playTactileClick();
    const newId = `note-${Date.now()}`;
    let defaultContent = '';
    let defaultTitle = 'Untitled Research Note';

    if (type === 'synthesis') {
      defaultTitle = 'Literature Synthesis: New Theme';
      defaultContent = `# Literature Synthesis: New Theme

## 1. Research Question
What is the primary empirical debate?

## 2. Main Thematic Streams
- Stream A:
- Stream B:

## 3. Supporting Evidence Across Library
- 

## 4. Contradictory Findings & Methodological Gaps
- 

## 5. Synthesis & Conceptual Takeaway
- `;
    } else if (type === 'paper') {
      defaultTitle = 'Critical Appraisal of Publication';
      defaultContent = `# Critical Reading Notes

## Core Methodology Critique
- 

## Data Validity & Potential Confounders
- 

## Direct Application to Doctoral Dissertation
- `;
    } else {
      defaultTitle = 'General Research Reflection';
      defaultContent = `Reflections, brainstormed experimental protocols, or discussion notes...`;
    }

    const newNote: ResearchNote = {
      id: newId,
      title: defaultTitle,
      content: defaultContent,
      type,
      paperIds: papers[0] ? [papers[0].id] : [],
      collectionIds: [],
      tags: ['Draft'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveNote(newNote);
    handleSelectNote(newNote);
    setIsEditing(true);
  };

  const handleSaveCurrent = () => {
    if (!activeNote) return;
    playTactileClick();
    const updated: ResearchNote = {
      ...activeNote,
      title: editTitle.trim() || 'Untitled Note',
      content: editContent,
      type: editType,
      paperIds: selectedPaperIds,
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(updated);
    setIsEditing(false);
  };

  // Resolve referenced papers
  const referencedPapers = papers.filter((p) => activeNote?.paperIds.includes(p.id));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
            PERSONAL SCHOLAR'S NOTEBOOK · {notes.length} ENTRIES
          </span>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#141414] mt-0.5">
            Research Notebook & Synthesis
          </h1>
        </div>

        {/* Quick New Note Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreateNew('synthesis')}
            className="px-3 py-1.5 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-semibold flex items-center gap-1.5 hover:bg-[#19328D] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ SYNTHESIS NOTE</span>
          </button>
          <button
            onClick={() => handleCreateNew('general')}
            className="px-3 py-1.5 border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ GENERAL NOTE</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Left Notes Rail / Right Markdown Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[75vh]">
        {/* Left Column: Notes List (4 cols) */}
        <div className="md:col-span-4 border border-[#141414]/15 bg-white flex flex-col justify-between overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-[#141414]/10 bg-[#EDEBE6]/40 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#77736B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search research notes..."
                className="w-full pl-8 pr-2 py-1 bg-white border border-[#141414]/20 text-xs font-mono focus:outline-hidden"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto text-[10px] font-mono">
              {(['all', 'synthesis', 'paper', 'general'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 border uppercase transition-colors cursor-pointer ${
                    filterType === t
                      ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                      : 'bg-white text-[#141414] border-[#141414]/15 hover:border-[#141414]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#141414]/10 p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-[#77736B]">
                No notes found matching current filter.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === activeNote?.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`w-full text-left p-3 rounded-[2px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4F2ED] border-l-3 border-[#1F3FB0] shadow-xs'
                        : 'hover:bg-stone-50 border-l-3 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#77736B]">
                      <span className="uppercase font-semibold text-[#1F3FB0]">{note.type}</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-serif font-medium text-sm text-[#141414] mt-1 line-clamp-1">
                      {note.title}
                    </div>
                    <p className="text-xs font-sans text-[#141414]/70 line-clamp-2 mt-1 leading-snug">
                      {note.content.replace(/^[#\s\-*]+/gm, '')}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Workspace & Editor (8 cols) */}
        {activeNote ? (
          <div className="md:col-span-8 p-6 md:p-8 bg-white border border-[#141414]/15 flex flex-col justify-between overflow-y-auto space-y-6">
            <div>
              {/* Header Action Bar */}
              <div className="flex items-center justify-between border-b border-[#141414]/15 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#77736B]">
                  <span className="uppercase px-2 py-0.5 bg-[#EDEBE6] border border-[#141414]/10 font-bold text-[#1F3FB0]">
                    {activeNote.type.toUpperCase()} NOTE
                  </span>
                  <span>Updated {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveCurrent}
                      className="px-3 py-1 bg-[#1F3FB0] text-white text-xs font-mono uppercase font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 border border-[#141414]/25 hover:border-[#1F3FB0] hover:text-[#1F3FB0] text-xs font-mono uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-1 text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title Input or View */}
              <div className="mt-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 font-serif text-2xl font-medium text-[#141414] border border-[#141414]/20 focus:border-[#1F3FB0] focus:outline-hidden"
                  />
                ) : (
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-[#141414] leading-snug">
                    {activeNote.title}
                  </h2>
                )}
              </div>

              {/* Linked Publications & Backlinks Bar */}
              <div className="my-4 p-3 bg-[#EDEBE6]/40 border border-[#141414]/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#77736B]">
                  <span className="font-bold text-[#141414] flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#1F3FB0]" />
                    <span>REFERENCED LIBRARY PAPERS ({referencedPapers.length})</span>
                  </span>
                  {isEditing && (
                    <span className="text-[10px]">Select papers linked to this note</span>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {papers.map((p) => {
                      const isLinked = selectedPaperIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaperIds((prev) =>
                              isLinked ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                            );
                          }}
                          className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                            isLinked
                              ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                              : 'bg-white text-[#77736B] border-[#141414]/20'
                          }`}
                        >
                          VOL. {p.number} · {p.shortTitle}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {referencedPapers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectPaper(p)}
                        className="px-2 py-1 bg-white border border-[#141414]/20 hover:border-[#1F3FB0] text-xs font-mono flex items-center gap-1.5 group cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-[#1F3FB0]" />
                        <span className="group-hover:text-[#1F3FB0]">
                          VOL. {p.number}: {p.shortTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Body Editor or Rendered View */}
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    rows={16}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write detailed markdown research notes, synthesis arguments, and methodology critiques..."
                    className="w-full p-4 font-mono text-xs leading-relaxed bg-[#EDEBE6]/20 border border-[#141414]/25 focus:border-[#1F3FB0] focus:outline-hidden"
                  />
                ) : (
                  <div className="prose max-w-none text-[#141414]/90 whitespace-pre-wrap font-serif text-sm md:text-base leading-relaxed">
                    {activeNote.content}
                  </div>
                )}
              </div>
            </div>

            {/* Note Footer */}
            <div className="pt-4 border-t border-[#141414]/15 flex items-center justify-between text-xs font-mono text-[#77736B]">
              <span>Created {new Date(activeNote.createdAt).toLocaleDateString()}</span>
              <span>Marginalia Knowledge Notebook</span>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 p-12 bg-white border border-[#141414]/15 flex items-center justify-center text-xs font-mono text-[#77736B]">
            Select or create a note to begin synthesis.
          </div>
        )}
      </div>
    </div>
  );
};
