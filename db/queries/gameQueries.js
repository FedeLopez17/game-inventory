const pool = require("../../config/pool.js");

module.exports = {
  getAllGames: async () => {
    const { rows } = await pool.query(
      `
    SELECT
        v.id AS videogame_id,
        v.title,
        v.release_date,
        v.cover_image_url,
        v.banner_image_url,
        v.description,
        v.website,
        v.added_at,
        v.metacritic_rating,
        v.opencritic_rating,
        v.ign_rating,
        v.goty,
        er.rating AS esrb_rating,
        er.description AS esrb_description,
        er.image_url AS esrb_image_url,
        pr.rating AS pegi_rating,
        pr.description AS pegi_description,
        pr.image_url AS pegi_image_url,
        ARRAY_AGG(DISTINCT g.name) AS genres,
        ARRAY_AGG(DISTINCT p.name) AS platforms,
        ARRAY_AGG(DISTINCT pub.name) AS publishers,
        ARRAY_AGG(DISTINCT s.name) AS studios,
        ARRAY_AGG(DISTINCT i.image_url) AS images
    FROM
        public.videogames v
    LEFT JOIN public.esrb_ratings er ON v.esrb_rating_id = er.id
    LEFT JOIN public.pegi_ratings pr ON v.pegi_rating_id = pr.id
    LEFT JOIN public.videogames_genres vg ON v.id = vg.videogame_id
    LEFT JOIN public.genres g ON vg.genre_id = g.id
    LEFT JOIN public.videogames_platforms vp ON v.id = vp.videogame_id
    LEFT JOIN public.platforms p ON vp.platform_id = p.id
    LEFT JOIN public.videogames_publishers vpub ON v.id = vpub.videogame_id
    LEFT JOIN public.publishers pub ON vpub.publisher_id = pub.id
    LEFT JOIN public.videogames_studios vs ON v.id = vs.videogame_id
    LEFT JOIN public.studios s ON vs.studio_id = s.id
    LEFT JOIN public.images i ON v.id = i.videogame_id
    GROUP BY
        v.id, er.id, pr.id
    `
    );
    return rows;
  },

  getGameByName: async (name) => {
    const { rows } = await pool.query(
      `
      SELECT
          v.id AS videogame_id,
          v.title,
          v.release_date,
          v.cover_image_url,
          v.banner_image_url,
          v.description,
          v.website,
          v.added_at,
          v.metacritic_rating,
          v.opencritic_rating,
          v.ign_rating,
          v.goty,
          er.rating AS esrb_rating,
          er.description AS esrb_description,
          pr.rating AS pegi_rating,
          pr.description AS pegi_description,
          ARRAY_AGG(DISTINCT g.name) AS genres,
          ARRAY_AGG(DISTINCT p.name) AS platforms,
          ARRAY_AGG(DISTINCT pub.name) AS publishers,
          ARRAY_AGG(DISTINCT s.name) AS studios,
          ARRAY_AGG(DISTINCT i.image_url) AS images
      FROM
          public.videogames v
      LEFT JOIN public.esrb_ratings er ON v.esrb_rating_id = er.id
      LEFT JOIN public.pegi_ratings pr ON v.pegi_rating_id = pr.id
      LEFT JOIN public.videogames_genres vg ON v.id = vg.videogame_id
      LEFT JOIN public.genres g ON vg.genre_id = g.id
      LEFT JOIN public.videogames_platforms vp ON v.id = vp.videogame_id
      LEFT JOIN public.platforms p ON vp.platform_id = p.id
      LEFT JOIN public.videogames_publishers vpub ON v.id = vpub.videogame_id
      LEFT JOIN public.publishers pub ON vpub.publisher_id = pub.id
      LEFT JOIN public.videogames_studios vs ON v.id = vs.videogame_id
      LEFT JOIN public.studios s ON vs.studio_id = s.id
      LEFT JOIN public.images i ON v.id = i.videogame_id
      WHERE
          v.title ILIKE $1
      GROUP BY
          v.id, er.id, pr.id
      `,
      [name]
    );
    return rows[0];
  },

  addGame: async (
    title,
    coverImage,
    bannerImage,
    releaseDate,
    description,
    website,
    platforms,
    pegiRating,
    esrbRating,
    metacriticRating,
    opencriticRating,
    ignRating,
    genre,
    studio,
    publisher,
    goty
  ) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const gameResult = await client.query(
        "INSERT INTO videogames (title, release_date, cover_image_url, banner_image_url, description, website, pegi_rating_id, esrb_rating_id, metacritic_rating, opencritic_rating, ign_rating, goty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id",
        [
          title,
          releaseDate,
          coverImage,
          bannerImage,
          description,
          website,
          pegiRating,
          esrbRating,
          metacriticRating,
          opencriticRating,
          ignRating,
          goty,
        ]
      );
      const gameId = gameResult.rows[0].id;

      for (let genreId of genre) {
        await client.query(
          "INSERT INTO videogames_genres (videogame_id, genre_id) VALUES ($1, $2)",
          [gameId, genreId]
        );
      }

      for (let platformId of platforms) {
        await client.query(
          "INSERT INTO videogames_platforms (videogame_id, platform_id) VALUES ($1, $2)",
          [gameId, platformId]
        );
      }

      for (let studioId of studio) {
        await client.query(
          "INSERT INTO videogames_studios (videogame_id, studio_id) VALUES ($1, $2)",
          [gameId, studioId]
        );
      }

      for (let publisherId of publisher) {
        await client.query(
          "INSERT INTO videogames_publishers (videogame_id, publisher_id) VALUES ($1, $2)",
          [gameId, publisherId]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
