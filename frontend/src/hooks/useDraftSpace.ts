import { useState, useEffect, useCallback } from 'react';

interface DraftSpace {
  formData: any;
  currentStep: number;
  selectedImages: string[]; // Base64 encoded images
  lastSaved: string;
  id: string;
}

const DRAFT_KEY = 'space_draft';
const DRAFTS_LIST_KEY = 'space_drafts_list';

export const useDraftSpace = () => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<DraftSpace | null>(null);

  // Check if there's a draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setDraftData(parsedDraft);
        setHasDraft(true);
      } catch (error) {
        console.error('Error parsing draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback((formData: any, currentStep: number, images: File[]) => {
    // Get existing draft to preserve ID
    const existingDraft = localStorage.getItem(DRAFT_KEY);
    let draftId = `draft_${Date.now()}`;
    
    if (existingDraft) {
      try {
        const parsed = JSON.parse(existingDraft);
        draftId = parsed.id; // Keep the same ID
      } catch (e) {
        // If parse fails, use new ID
      }
    }
    
    // Convert images to base64 for storage
    const imagePromises = images.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(base64Images => {
      const draft: DraftSpace = {
        formData,
        currentStep,
        selectedImages: base64Images,
        lastSaved: new Date().toISOString(),
        id: draftId
      };

      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      
      // Also save to drafts list
      const draftsList = JSON.parse(localStorage.getItem(DRAFTS_LIST_KEY) || '[]');
      const existingIndex = draftsList.findIndex((d: any) => d.id === draft.id);
      
      const draftSummary = {
        id: draft.id,
        title: formData.title || 'Espacio sin título',
        address: formData.address || 'Sin dirección',
        lastSaved: draft.lastSaved,
        currentStep
      };

      if (existingIndex >= 0) {
        draftsList[existingIndex] = draftSummary;
      } else {
        draftsList.push(draftSummary);
      }
      
      localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(draftsList));
      setHasDraft(true);
    });
  }, []);

  // Load draft
  const loadDraft = useCallback(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      
      // Convert base64 images back to Files
      const imagePromises = parsedDraft.selectedImages.map(async (base64: string, index: number) => {
        const response = await fetch(base64);
        const blob = await response.blob();
        return new File([blob], `image_${index}.jpg`, { type: 'image/jpeg' });
      });

      return Promise.all(imagePromises).then(files => ({
        ...parsedDraft,
        selectedImages: files
      }));
    }
    return null;
  }, []);

  // Clear draft
  const clearDraft = useCallback((draftId?: string) => {
    if (draftId) {
      // Remove specific draft from list
      const draftsList = JSON.parse(localStorage.getItem(DRAFTS_LIST_KEY) || '[]');
      const filteredList = draftsList.filter((d: any) => d.id !== draftId);
      localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(filteredList));
      
      // If it's the current draft, clear it
      const currentDraft = localStorage.getItem(DRAFT_KEY);
      if (currentDraft) {
        const parsed = JSON.parse(currentDraft);
        if (parsed.id === draftId) {
          localStorage.removeItem(DRAFT_KEY);
          setHasDraft(false);
        }
      }
    } else {
      // Clear current draft
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    }
  }, []);

  // Get all drafts
  const getAllDrafts = useCallback(() => {
    const draftsList = localStorage.getItem(DRAFTS_LIST_KEY);
    return draftsList ? JSON.parse(draftsList) : [];
  }, []);

  return {
    hasDraft,
    draftData,
    saveDraft,
    loadDraft,
    clearDraft,
    getAllDrafts
  };
};