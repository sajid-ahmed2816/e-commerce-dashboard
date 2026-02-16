import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Box, Typography } from '@mui/material';
import UploadService from '../../api/upload/UploadService';
import 'ckeditor5/ckeditor5.css';

class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    async upload() {
        const file = await this.loader.file;
        const formData = new FormData();
        formData.append("file", file);

        const res = await UploadService.uploadImage(formData);

        return {
            default: res.url // image URL returned from backend
        };
    }

    abort() { }
};

const items = ['undo', 'redo', '|', 'heading', '|', '|', 'bold', 'italic', '|', 'link', 'imageUpload', '|', 'blockQuote', 'bulletedList', 'numberedList']

function Editor({ label, value, onChange, error }) {
    return (
        <Box>
            {label && (
                <Typography sx={{ mb: 1, fontWeight: 500 }}>
                    {label}
                </Typography>
            )}

            <CKEditor
                editor={ClassicEditor}
                data={value || ""}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
                config={{
                    toolbar: {
                        items: items
                    }
                }}
                onReady={(editor) => {
                    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                        return new UploadAdapter(loader);
                    };
                }}
            />

            {error && (
                <Typography color="error" variant="caption">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default Editor;
