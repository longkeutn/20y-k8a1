import React, { useEffect, useRef } from 'react';
import { compressImage } from './AdminAnnouncementManager'; // I will export this if needed, or I can just re-implement a simple compressor. Wait, let's just implement a standalone compressor.

const MAX_IMAGE_SIZE = 800;
const IMAGE_QUALITY = 0.5;

async function compressImageForEditor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          } else {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current && (window as any).Quill) {
      const Quill = (window as any).Quill;
      
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Nhập nội dung bài viết...',
        modules: {
          toolbar: {
            container: [
              [{ 'header': [2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['blockquote', 'table'],
              ['link', 'image'],
              ['clean']
            ],
            handlers: {
              image: function () {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();

                input.onchange = async () => {
                  const file = input.files ? input.files[0] : null;
                  if (file) {
                    try {
                      const base64 = await compressImageForEditor(file);
                      if (base64.length > 40000) {
                        alert('Ảnh này dung lượng vẫn hơi lớn (hơn 40KB) sau khi nén. Hãy thử ảnh nhỏ hơn để đảm bảo lưu trên hệ thống thành công nhé!');
                      }
                      const range = quillRef.current.getSelection();
                      const position = range ? range.index : 0;
                      quillRef.current.insertEmbed(position, 'image', base64);
                    } catch (e) {
                      console.error('Lỗi nén ảnh:', e);
                      alert('Không thể chèn ảnh này. Vui lòng thử lại.');
                    }
                  }
                };
              }
            }
          }
        }
      });

      // Update parent component state when content changes
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
      });

      // Initialize content
      if (value) {
        // Only set dangerouslyPasteHTML if it's the initial load to prevent cursor jumping
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, []);

  return (
    <div className="bg-white rounded-lg border border-slate-300 focus-within:border-amber-500 overflow-hidden">
      <div ref={editorRef} className="min-h-[250px] max-h-[600px] overflow-y-auto text-sm" />
      <style>{`
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
        }
        .ql-editor {
          min-height: 250px;
        }
        .ql-editor p {
          margin-bottom: 0.85rem;
          line-height: 1.75;
        }
        .ql-editor img {
          border-radius: 8px;
          margin: 10px auto;
          max-width: 100%;
        }
        .ql-editor h2, .ql-editor h3 {
          color: #78350f; /* amber-900 */
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
