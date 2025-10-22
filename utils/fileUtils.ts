
import { Base64File } from '../types';

/**
 * Utility to convert File object to a Base64 string and determine MIME type.
 * @param {File} file - The file object from the input.
 * @returns {Promise<Base64File>} An object containing base64 data, mimeType, and file name.
 */
export const fileToBase64 = (file: File): Promise<Base64File | null> => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            // Extract the base64 data part (remove the data URL header: data:mime/type;base64,)
            const base64String = reader.result.split(',')[1];
            resolve({ 
                name: file.name,
                base64: base64String, 
                mimeType: file.type || 'application/octet-stream' 
            });
        };
        reader.onerror = (error) => reject(error);
    });
};
