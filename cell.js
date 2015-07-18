var lifeCell = {};
lifeCell.CONST = {
    CELL_WIDTH: 10,
    CELL_HEIGHT: 10
};
lifeCell.Entity = {
    cells: [],
    cellsState: [],
    cellsNextState: [],
    texture0: {}, //dead 0
    texture1: {}  //live 1
};
lifeCell.State = {
    isPhaser: {},
    isEnchant: {}
};
lifeCell.Method = {
    /**
     * セルを一つ生成して返します
     * @param {number} x 配置するX座標
     * @param {number} y 配置するY座標
     * @param {number} fill 塗りつぶし色。0で黒に、それ以外で白に塗りつぶす。
     * @return {object} 生成されたセル
     */
    createCell: function(x, y, fill){
        if(lifeCell.State.isPhaser){
            var cell = game.add.sprite(x, y);
        }else if(lifeCell.State.isEnchant){
            var cell = new enchant.Sprite(lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            cell.x = x;
            cell.y = y;
            cell.addEventListener('touchstart', function(e){
                    var c = lifeCell.Method.calcCellNearValue(y/lifeCell.CONST.CELL_WIDTH, x/lifeCell.CONST.CELL_HEIGHT);
                    console.log("x:" + x + ", y:" + y + ", c:" + c);
                    });
            if(fill === 0){
                lifeCell.Method.updateTexture(cell, lifeCell.Entity.texture0);
            }else{
                lifeCell.Method.updateTexture(cell, lifeCell.Entity.texture1);
            }
            core.rootScene.addChild(cell);
        }
        return cell;
    },
    /**
     * テクスチャの生成
     */
    createTexture: function(){
        if(lifeCell.State.isPhaser){
            lifeCell.Entity.texture0 = new Phaser.BitmapData(game, "deadCell", lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            lifeCell.Entity.texture0.rect(0,0,lifeCell.CONST.CELL_WIDTH,lifeCell.CONST.CELL_HEIGHT, "#fff"); //白
            lifeCell.Entity.texture1 = new Phaser.BitmapData(game, "liveCell", lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            lifeCell.Entity.texture1.rect(0,0,lifeCell.CONST.CELL_WIDTH,lifeCell.CONST.CELL_HEIGHT, "#000"); //黒
        }else if(lifeCell.State.isEnchant){
            lifeCell.Entity.texture0 = new enchant.Surface(lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            var ctx1 = lifeCell.Entity.texture0.context;
            ctx1.fillStyle = "#fff"; //白
            ctx1.fillRect(0, 0, lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            lifeCell.Entity.texture1 = new enchant.Surface(lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
            var ctx2 = lifeCell.Entity.texture1.context;
            ctx2.fillStyle = "#000"; //黒
            ctx2.fillRect(0, 0, lifeCell.CONST.CELL_WIDTH, lifeCell.CONST.CELL_HEIGHT);
        }
    },
    /*
     * 初期状態を設定する
     */
    init: function(){
        if(window.Phaser){
            lifeCell.State.isPhaser = true;
            lifeCell.State.isEnchant = false;
        }else if(window.enchant){
            lifeCell.State.isPhaser = false;
            lifeCell.State.isEnchant = true;
        }
        lifeCell.Method.createTexture();
        var w, h;
        if(lifeCell.State.isPhaser){
            w = game.width;
            h = game.height;
        }else if(lifeCell.State.isEnchant){
            w = core.width;
            h = core.height;
        }
        //生成する縦横のセル数
        console.log(lifeCell)
        var wn = Math.floor(w/lifeCell.CONST.CELL_WIDTH);
        var hn = Math.floor(h/lifeCell.CONST.CELL_HEIGHT);
        //横向きの配列を縦に積み上げる
        for(var i=0;i<hn;i++){
            lifeCell.Entity.cells[i] = [];
            lifeCell.Entity.cellsState[i] = [];
            lifeCell.Entity.cellsNextState[i] = [];
            for(var j=0;j<wn;j++){
                var state = Math.abs(Math.round(Math.random() - 0.42));
                var cell = lifeCell.Method.createCell(j * lifeCell.CONST.CELL_WIDTH, i * lifeCell.CONST.CELL_HEIGHT, state);
                lifeCell.Entity.cells[i][j] = cell;
                lifeCell.Entity.cellsState[i][j] = state;
            }
        }
        console.log("init done. wn:" + wn + ", hn:" + hn);
    },

    /*
     * 現在のセル状態に次のステップのセル状態を更新する
     */
    injectCellsNextState: function(){
        var iLeng = lifeCell.Entity.cellsState.length;
        var jLeng = lifeCell.Entity.cellsState[0].length;
        for(var i=0;i<iLeng;i++){
            for(var j=0;j<jLeng;j++){
        lifeCell.Entity.cellsState[i][j] = lifeCell.Entity.cellsNextState[i][j];
            }
        }
        for(var i=0;i<iLeng;i++){
            for(var j=0;j<jLeng;j++){
                if(lifeCell.Entity.cellsNextState[i][j] === 0){
                    lifeCell.Method.updateTexture(lifeCell.Entity.cells[i][j], lifeCell.Entity.texture0);
                }else{
                    lifeCell.Method.updateTexture(lifeCell.Entity.cells[i][j], lifeCell.Entity.texture1);
                }
            }
        }
    },
    /*
     * 次のステップで描画される状態配列を生成
     */
    calcCellsNextState: function(){
        var debug = [];
        var ileng = lifeCell.Entity.cells.length;
        var jleng = lifeCell.Entity.cells[0].length;
        for(var i=0;i<ileng;i++){
            for(var j=0;j<jleng;j++){
                var nearValue = lifeCell.Method.calcCellNearValue(i, j); // 近傍値合計を取得
                debug.push(nearValue);
               if(nearValue === 3){
                   lifeCell.Entity.cellsNextState[i][j] = 1; // 誕生or生存
               }else if(lifeCell.Entity.cellsState[i][j] === 1 && nearValue === 2){
                   lifeCell.Entity.cellsNextState[i][j] = 1; // 生存
               }else{
                   lifeCell.Entity.cellsNextState[i][j] = 0; // 死亡
               }
            }
        }
    },
    /*
     * ドラクエ空間で回り込みながら周囲のセルの状態を合算する
     * @param {number} i cells配列のy軸位置番号
     * @param {number} j cells配列のx軸位置番号
     * @return {number} 近傍8セルの状態合計値 0-8
     */
    calcCellNearValue: function(i, j, opt){
        var j_left, j_right, i_top, i_bottom;
        if(i === 0){
            i_top    = lifeCell.Entity.cellsState.length - 1;
            i_bottom = i + 1;
        }else if(i === lifeCell.Entity.cellsState.length - 1){
            i_top    = i - 1;
            i_bottom = 0;
        }else{
            i_top    = i - 1;
            i_bottom = i + 1;
        }
        if(j === 0){
            j_left   = lifeCell.Entity.cellsState[0].length - 1;
            j_right  = j + 1;
        }else if(j === lifeCell.Entity.cellsState[0].length - 1){
            j_left   = j - 1;
            j_right  = 0;
        }else{
            j_left   = j - 1;
            j_right  = j + 1;
        }
        var value = 
        lifeCell.Entity.cellsState[i_top][j_left] + 
        lifeCell.Entity.cellsState[i_top][j]+ 
        lifeCell.Entity.cellsState[i_top][j_right]+ 
        lifeCell.Entity.cellsState[i][j_left]+ 
        lifeCell.Entity.cellsState[i][j_right]+ 
        lifeCell.Entity.cellsState[i_bottom][j_left]+ 
        lifeCell.Entity.cellsState[i_bottom][j]+ 
        lifeCell.Entity.cellsState[i_bottom][j_right];

        if(opt === true){
        }
        return value;
    },
    updateTexture: function(targCell, texture){
        if(lifeCell.State.isPhaser){
            targCell.loadTexture(texture);
        }else if(lifeCell.State.isEnchant){
            targCell.image = texture;
        }
    }
}
module.exports = stages;
