import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

interface TagCellProps {
  row: any; // replace with your specific type if needed
  existingTags: string[];
  onTagsUpdate: (rowId: string, newTags: string[]) => Promise<void>;
}

const TagCell: React.FC<TagCellProps> = ({ row, existingTags, onTagsUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(row.tags || []);

  const handleSaveTags = async () => {
    try {
      await onTagsUpdate(row.id, localTags);
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  return (
    <>
      <div onClick={() => setDialogOpen(true)} style={{ cursor: 'pointer' }}>
        {localTags.length === 0 ? (
          <span>No Tags</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {localTags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="badge bg-secondary"
                style={{ fontSize: '0.75em', padding: '4px 6px' }}
              >
                {tag}
              </span>
            ))}
            {localTags.length > 3 && (
              <span className="badge bg-info" style={{ fontSize: '0.75em', padding: '4px 6px' }}>
                +{localTags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Tags</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <CreatableSelect
              components={makeAnimated()}
              isMulti
              value={localTags.map((tag) => ({ label: tag, value: tag }))}
              onChange={(selected) => {
                const newValues = selected ? selected.map((s) => s.value) : [];
                setLocalTags(newValues);
              }}
              options={existingTags.map((tag) => ({ label: tag, value: tag }))}
              onCreateOption={(inputValue) => {
                if (inputValue && !localTags.includes(inputValue)) {
                  setLocalTags((prev) => [...prev, inputValue]);
                }
              }}
              placeholder="Type or select tags"
              styles={{
                control: (base) => ({
                  ...base,
                  minWidth: '300px',
                  fontSize: '1em',
                  padding: '8px',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  borderRadius: '0.25rem',
                  margin: '2px',
                  fontSize: '1em',
                  display: 'flex',
                  alignItems: 'center',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'white',
                  padding: '0 6px',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'white',
                  ':hover': {
                    backgroundColor: '#5a6268',
                    color: 'white',
                  },
                }),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveTags} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TagCell;
