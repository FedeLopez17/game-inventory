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

  getGamesByGenre: async (genre) => {
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
    WHERE g.name = $1
    GROUP BY
        v.id, er.id, pr.id
    `,
      [genre]
    );
    return rows;
  },

  getGamesByStudio: async (studioId) => {
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
    WHERE s.id = $1
    GROUP BY
        v.id, er.id, pr.id
    `,
      [studioId]
    );
    return rows;
  },

  getGamesByPublisher: async (publisherId) => {
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
    WHERE pub.id = $1
    GROUP BY
        v.id, er.id, pr.id
    `,
      [publisherId]
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

  getGameById: async (id) => {
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
          v.id = $1
      GROUP BY
          v.id, er.id, pr.id
      `,
      [id]
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

      // Ensure inputs are arrays
      // We make sure that inputs are arrays so that we can iterate over them, even if they only have one item.
      // Otherwise, if the inputs were strings, we would iterate over each character.
      if (!Array.isArray(genre)) genre = [genre];
      if (!Array.isArray(platforms)) platforms = [platforms];
      if (!Array.isArray(studio)) studio = [studio];
      if (!Array.isArray(publisher)) publisher = [publisher];

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

  deleteGameById: async (id) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM videogames_genres WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_platforms WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_publishers WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_studios WHERE videogame_id = $1",
        [id]
      );
      await client.query("DELETE FROM images WHERE videogame_id = $1", [id]);

      const deletionResult = await client.query(
        "DELETE FROM videogames WHERE id = $1",
        [id]
      );

      await client.query("COMMIT");
      return deletionResult.rowCount > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting videogame:", error);
      return false;
    } finally {
      client.release();
    }
  },

  updateGame: async (
    id,
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

      await client.query(
        "UPDATE videogames SET title = $1, release_date = $2, cover_image_url = $3, banner_image_url = $4, description = $5, website = $6, pegi_rating_id = $7, esrb_rating_id = $8, metacritic_rating = $9, opencritic_rating = $10, ign_rating = $11, goty = $12 WHERE id = $13",
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
          id,
        ]
      );

      // Ensure inputs are arrays
      if (!Array.isArray(genre)) genre = [genre];
      if (!Array.isArray(platforms)) platforms = [platforms];
      if (!Array.isArray(studio)) studio = [studio];
      if (!Array.isArray(publisher)) publisher = [publisher];

      // Clear and reinsert related data
      await client.query(
        "DELETE FROM videogames_genres WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_platforms WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_studios WHERE videogame_id = $1",
        [id]
      );
      await client.query(
        "DELETE FROM videogames_publishers WHERE videogame_id = $1",
        [id]
      );

      for (let genreId of genre) {
        await client.query(
          "INSERT INTO videogames_genres (videogame_id, genre_id) VALUES ($1, $2)",
          [id, genreId]
        );
      }

      for (let platformId of platforms) {
        await client.query(
          "INSERT INTO videogames_platforms (videogame_id, platform_id) VALUES ($1, $2)",
          [id, platformId]
        );
      }

      for (let studioId of studio) {
        await client.query(
          "INSERT INTO videogames_studios (videogame_id, studio_id) VALUES ($1, $2)",
          [id, studioId]
        );
      }

      for (let publisherId of publisher) {
        await client.query(
          "INSERT INTO videogames_publishers (videogame_id, publisher_id) VALUES ($1, $2)",
          [id, publisherId]
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
