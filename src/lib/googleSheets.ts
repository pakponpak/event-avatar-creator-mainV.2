import { Attendee } from "@/types/attendee";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

export const sheetApi = {
    fetchAttendees: async (): Promise<Attendee[]> => {
        if (!SCRIPT_URL) return [];
        try {
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            return data.map((a: any) => ({
                ...a,
                is_winner: a.is_winner === true || a.is_winner === 'true'
            }));
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            return [];
        }
    },

    insertAttendee: async (attendee: Partial<Attendee>) => {
        if (!SCRIPT_URL) throw new Error('Google Sheets URL not configured');
        const response = await fetch(`${SCRIPT_URL}?action=insert`, {
            method: 'POST',
            body: JSON.stringify(attendee),
        });
        return response.json();
    },

    updateAttendee: async (id: string, data: Partial<Attendee>) => {
        if (!SCRIPT_URL) throw new Error('Google Sheets URL not configured');
        const response = await fetch(`${SCRIPT_URL}?action=update`, {
            method: 'POST',
            body: JSON.stringify({ id, ...data }),
        });
        return response.json();
    },

    deleteAttendee: async (id: string) => {
        if (!SCRIPT_URL) throw new Error('Google Sheets URL not configured');
        const response = await fetch(`${SCRIPT_URL}?action=delete`, {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        return response.json();
    },

    resetWinners: async () => {
        if (!SCRIPT_URL) throw new Error('Google Sheets URL not configured');
        const response = await fetch(`${SCRIPT_URL}?action=reset_winners`, {
            method: 'POST',
        });
        return response.json();
    }
};
