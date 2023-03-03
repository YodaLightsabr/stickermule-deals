import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

export default async function find (req, res) {
    const supabase = createClient(process.env.DB_ENDPOINT, process.env.DB_KEY);

    const html = await fetch(req.query?.url ?? req.params?.url ?? 'https://stickermule.com/deals').then(res => res.text());
    const $ = cheerio.load(html);

    const id = $(`#mainContent > main > section > div.heroContent > div.actionWrapper > form`).attr('action').split('/').reverse()[1];
    const link = `https://stickermule.com/deals/${id}`;
    const title = $(`#mainContent > main > section > div.heroContent > h1`).text();
    const subtitle = $(`#mainContent > main > section > div.heroContent > h2`).text();
    const description = $(`#mainContent > main > section > div.heroContent > div.subtitle > div > p`).text();
    const product = $(`#mainContent > main > section > div.heroContent > div.actionWrapper > p > a`).attr('href');

    const deal = {
        id,
        link,
        title,
        subtitle,
        description,
        product
    };
    
    const { data, error } = await supabase
        .from('deals')
        .select()
        .eq('id', id)
        .limit(1)

    if (error) return res.status(500).json({ error: error, step: 'select_existing_record', deal });
    if (data.length) return res.status(200).json({ new: false, deal: data[0] });

    else {
        const { data, error } = await supabase
            .from('deals')
            .insert(deal)

        if (error) return res.status(500).json({ error: error, step: 'insert_new_record', deal });

        res.status(200).json({ new: true, deal: { ...deal, found_at: Date.now() } });
    }
}