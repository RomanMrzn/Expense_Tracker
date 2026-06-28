import pool from "../db.js";

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name",
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GetCategories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCategory = async (req, res) => {
  const { name, type, icon, color } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Name and type are required" });
  }
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Type must be income or expense" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type, icon, color, is_default)
            VALUES ($1, $2, $3, $4, $5, false)
            RETURNING *`,
      [req.userId, name, type, icon || null, color || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }
    console.error("CreateCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, icon, color } = req.body;

  try {
    const result = await pool.query(
      `UPDATE categories
            SET name = COALESCE($1, name),
                icon = COALESCE($2, icon),
                color = COALESCE($3, color)
            WHERE id = $4 AND user_id = $5
            RETURNING *`,
      [name, icon, color, id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UpdateCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DeleteCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
