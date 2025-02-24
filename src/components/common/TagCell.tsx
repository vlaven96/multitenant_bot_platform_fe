import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import 'react-toastify/dist/ReactToastify.css';

interface TagCellProps {
  row: any;  // or a more specific type for your row data
  existingTags: string[];
  onTagsUpdate: (rowId: string, newTags: string[]) => Promise<void>;
}

const TagCell: React.FC<TagCellProps> = ({ row, existingTags, onTagsUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(row.tags || []);

  const handleSaveTags = async () => {
    try {
      // This call updates the backend and merges new tags into existingTags
      await onTagsUpdate(row.id, localTags);
      // Switch out of edit mode
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  useEffect(() => {
    if (editMode) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          handleSaveTags();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editMode, localTags]);

  if (!editMode) {
    // Display mode
    if (localTags.length === 0) {
      return <span onClick={() => setEditMode(true)}>No Tags</span>;
    }
    return (
      <div onClick={() => setEditMode(true)} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {localTags.slice(0, 3).map((tag, i) => (
          <span key={i} className="badge bg-secondary" style={{ fontSize: '0.75em', padding: '4px 6px' }}>
            {tag}
          </span>
        ))}
        {localTags.length > 3 && (
          <span className="badge bg-info" style={{ fontSize: '0.75em', padding: '4px 6px' }}>
            +{localTags.length - 3} more
          </span>
        )}
      </div>
    );
  } else {
    // Edit mode
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        <CreatableSelect
          components={makeAnimated()}
          isMulti
          value={localTags.map((t) => ({ label: t, value: t }))}
          onChange={(selected) => {
            const newValues = selected ? selected.map((s) => s.value) : [];
            setLocalTags(newValues);
            handleSaveTags(); // Automatically save on change
          }}
          options={existingTags.map((t) => ({ label: t, value: t }))}
          onCreateOption={(inputValue) => {
            if (inputValue && !localTags.includes(inputValue)) {
              setLocalTags((prev) => [...prev, inputValue]);
              handleSaveTags(); // Automatically save on new tag creation
            }
          }}
          placeholder="Type or select tags"
          className="tag-input"
          styles={{
            control: (base) => ({
              ...base,
              minWidth: '200px',
              fontSize: '0.75em',
              border: 'none',
              boxShadow: 'none',
              padding: '4px 6px',
            }),
            // Make the selected tags look like .badge.bg-secondary
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#6c757d',   // bootstrap .bg-secondary
              color: 'white',
              borderRadius: '0.25rem',
              margin: '2px',
              fontSize: '0.75em',
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
                backgroundColor: '#5a6268', // slightly darker .bg-secondary
                color: 'white',
              },
            }),
          }}
        />
      </div>
    );
  }
};

export default TagCell;
