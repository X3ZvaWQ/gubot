const { DataTypes, Model } = require("sequelize");
let sequelize = bot.sequelize;

class Subscribe extends Model {}
Subscribe.init(
    {
        group_id: DataTypes.STRING,
        user_qq: DataTypes.STRING,
    },
    {
        sequelize,
        modelName: "Subscribe",
        tableName: "subscribe",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Subscribe;
