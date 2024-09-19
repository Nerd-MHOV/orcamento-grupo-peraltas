//@ts-nocheck
import React, { useCallback, useMemo, useState } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate, RenderElementProps, RenderLeafProps } from 'slate-react'
import {
    Editor,
    Transforms,
    createEditor,
    Descendant,
    Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'

import { Button, Icon, Toolbar } from './components'
import {
    FormatBold, FormatItalic, FormatUnderlined, LooksOne, LooksTwo, FormatQuote, FormatListNumbered, FormatListBulleted, FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
    FormatAlignJustify,
    InsertPageBreak
} from '@mui/icons-material'
import initialValue from './initialvalueText'
import { TextField } from '@mui/material'

const HOTKEYS: { [key: string]: string } = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+q': 'break',
}

const LIST_TYPES: string[] = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES: string[] = ['left', 'center', 'right', 'justify']

const TextEditor: React.FC<{ setText: React.Dispatch<Descendant[]> , linesToBreakPage: number, setLinesToBreakPage: React.Dispatch<number>}> = ({
    setText,
    linesToBreakPage,
    setLinesToBreakPage
}) => {
    const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, [])
    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, [])
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])

    return (
        <Slate editor={editor} initialValue={initialValue} onChange={value => setText(value)}>
            <Toolbar>
                <MarkButton format="bold" icon={<FormatBold />} />
                <MarkButton format="italic" icon={<FormatItalic />} />
                <MarkButton format="underline" icon={<FormatUnderlined />} />
                <BlockButton format="heading-one" icon={<LooksOne />} />
                <BlockButton format="heading-two" icon={<LooksTwo />} />
                <BlockButton format="numbered-list" icon={<FormatListNumbered />} />
                <BlockButton format="bulleted-list" icon={<FormatListBulleted />} />
                <BlockButton format="left" icon={<FormatAlignLeft />} />
                <BlockButton format="center" icon={<FormatAlignCenter />} />
                <BlockButton format="right" icon={<FormatAlignRight />} />
                <BlockButton format="justify" icon={<FormatAlignJustify />} />
                <BlockButton icon={<InsertPageBreak />} onClick={event => {
                    event.preventDefault()
                    const breakPageElement = { type: 'breakPage', children: [{ text: '<---------------------breakPage--------------------->' }] }
                    editor.insertNode(breakPageElement)
                }}
                />
                <TextField
                    type="number"
                    className="textField"
                    variant="standard"
                    value={linesToBreakPage}
                    style={{
                        maxWidth: '35px',
                        // marginTop: '-20px',
                        marginLeft: '50px',
                        maxHeight: '20px',
                    }}
                    onChange={(e) => {
                        let line = +e.target.value
                        if (line < 15) line = 15
                        if (line > 25) line = 25
                        setLinesToBreakPage(line)
                    }}
                />
            </Toolbar>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter some rich text…"
                spellCheck
                autoFocus
                style={{
                    overflow: 'scroll',
                    maxHeight: '400px',
                }}
                onKeyDown={event => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event as any)) {
                            event.preventDefault()
                            const mark = HOTKEYS[hotkey]
                            if (hotkey === 'mod+q') {
                                const breakPageElement = { type: 'breakPage', children: [{ text: '<---------------------breakPage--------------------->' }] }
                                editor.insertNode(breakPageElement)
                            }
                            toggleMark(editor, mark)
                        }
                    }
                }}
            />
        </Slate>
    )
}

const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
    )
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type as string) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    })
    let newProperties: Partial<SlateElement>
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format,
        }
    } else {
        newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        }
    }
    Transforms.setNodes<SlateElement>(editor, newProperties)

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n[blockType] === format,
        })
    )

    return !!match
}

const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const Element: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
    const style = { textAlign: (element as any).align }
    switch (element.type) {
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            )
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            )
        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            )
        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            )
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            )
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            )
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            )
    }
}

const Leaf: React.FC<RenderLeafProps> = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = <code>{children}</code>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    return <span {...attributes}>{children}</span>
}

interface BlockButtonProps {
    format: string
    icon: React.ReactElement
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon, onClick = () => { } }) => {
    const editor = useSlate()
    return (
        <Button
            onClick={onClick}
            active={isBlockActive(
                editor,
                format,
                TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
            )}
            onMouseDown={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

interface MarkButtonProps {
    format: string
    icon: React.ReactElement
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isMarkActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleMark(editor, format)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}

export default TextEditor
