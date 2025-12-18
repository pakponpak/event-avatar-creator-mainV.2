import { supabase } from './src/integrations/supabase/client';

async function testDelete() {
    console.log('Testing deletion...');

    // First, find a user or create one
    const { data: user, error: fetchError } = await supabase
        .from('attendees')
        .select('id')
        .limit(1)
        .single();

    if (fetchError || !user) {
        console.error('No users found to test delete or error fetching:', fetchError);
        return;
    }

    console.log('Attempting to delete user ID:', user.id);
    const { error: deleteError } = await supabase
        .from('attendees')
        .delete()
        .eq('id', user.id);

    if (deleteError) {
        console.error('Delete failed with error:', deleteError);
        console.error('Error details:', JSON.stringify(deleteError, null, 2));
    } else {
        console.log('Successfully deleted user!');
    }
}

testDelete();
