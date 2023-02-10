
import { createClient } from '@supabase/supabase-js';

export default async function all (req, res) {
    const supabase = createClient(process.env.DB_ENDPOINT, process.env.DB_KEY);

    const { data, error } = await supabase
        .from('deals')
        .select()
        .limit(500)

    if (error) return res.status(500).json({ error: error, step: 'select_existing_deals' });

    res.status(200).json(data);
}