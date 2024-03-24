// src/Tiptap.jsx
import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import './styles.module.css';
import { Button, Flex, IconButton } from '@chakra-ui/react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { FaListOl } from 'react-icons/fa6';
import { FaListUl } from 'react-icons/fa6';
import { FaBold } from 'react-icons/fa6';
import { FaItalic } from 'react-icons/fa6';
import OrderedList from '@tiptap/extension-ordered-list';

interface Props {
  tiptapRef: React.RefObject<any>;
}

const Tiptap = ({ tiptapRef }: Props) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      BulletList,
      ListItem,
      Bold,
      Italic,
      OrderedList,
    ],
    content: `
        Take notes about your session here...
      `,
  });

  return (
    <div>
      <Flex mt="1rem">
        <IconButton
          aria-label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          variant={editor?.isActive('bold') ? 'solid' : 'ghost'}
          icon={<FaBold />}
        />
        <IconButton
          aria-label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          variant={editor?.isActive('italic') ? 'solid' : 'ghost'}
          icon={<FaItalic />}
        />
        <IconButton
          aria-label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          variant={editor?.isActive('bulletList') ? 'solid' : 'ghost'}
          icon={<FaListUl />}
        />
        <IconButton
          aria-label="Ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          variant={editor?.isActive('orderedList') ? 'solid' : 'ghost'}
          icon={<FaListOl />}
        />
      </Flex>
      <EditorContent editor={editor || null} className="tiptapTextArea" />

      <div style={{ display: 'none' }} ref={tiptapRef}>
        {editor?.getHTML()}
      </div>
    </div>
  );
};

export default Tiptap;
