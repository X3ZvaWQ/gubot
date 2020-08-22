var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = global.sequelize;

class FlowerPrice extends Model {}

FlowerPrice.init({
    server: {
        type: DataTypes.STRING
    },
    map: {
        type: DataTypes.STRING
    },
    flower: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.DATEONLY
    }
}, {
    sequelize,
    modelName: 'FlowerPrice',
    tableName: 'flower_prices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
module.exports = FlowerPrice;
