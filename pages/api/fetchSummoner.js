// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    const apiKey = process.env.RIOT_API_KEY;
    const { summonerName } = req.body;
    const summonerRequestUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;

    const summonerResponse = await fetch(summonerRequestUrl);
    let summonerData = await summonerResponse.json();

    // const summonerID = summonerData.puuid;
    // const matchesRequestUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerID}/ids?start=0&count=20&api_key=${apiKey}`;

    // const matchesResponse = await fetch(matchesRequestUrl);
    // let matchesData = await matchesResponse.json();

    if(summonerData.status){
        res.status(404).send(summonerData);
    }


    res.status(200).send(summonerData);
  }