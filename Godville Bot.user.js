// ==UserScript==
// @name         Godville Bot
// @namespace    http://godville.net/
// @version      0.410
// @description  Godville Automatic Stuff
// @author       UnstableFractal
// @match        http://godville.net/*
// @updateUrl    https://github.com/smsteel/godvillebot/raw/master/Godville%20Bot.user.js
// ==/UserScript==

// API
//@todo разделить API и бота на разные части
$.godville = {
    //@todo переделать setCounter и все связанное
    setCounter : function(name) {
        var count = parseInt(localStorage.getItem(name));
        if(count) {
            localStorage.setItem(name, count + 1);
        } else {
            localStorage.setItem(name, 1);
        }
    },
    setHealCount : function() {
        $.godville.setCounter("healcount");
    },
    getHealCount : function() {
        return localStorage.getItem("healcount")
    },
    setDigCount : function() {
        $.godville.setCounter("digcount");
    },
    getDigCount : function() {
        return localStorage.getItem("digcount")
    },
    setItemUseCount : function() {
        $.godville.setCounter("itemusecount");
    },
    getItemUseCount : function() {
        return localStorage.getItem("itemusecount");
    },
    setAccumulateCount : function() {
        $.godville.setCounter("accumulatecount");
    },
    getAccumulateCount : function() {
        return localStorage.getItem("accumulatecount")
    },
    health : function() {
        var text = $("#hk_health > div.l_val").text().split('/');
        return {
            current : parseInt(text[0]),
            maximum : parseInt(text[1])
        }
    },
    itemsValue : function() {
        return eval($(".eq_line").find(".eq_level").text());
    },
    getItemsProfit : function() {
        var lastDate = localStorage.getItem("itemsProfitLastDate");
        var currentDate = new Date().toDateString();
        if (lastDate != currentDate) {
            localStorage.setItem("itemsValue", $.godville.itemsValue());
            localStorage.setItem("itemsProfitLastDate", currentDate);
        }
        return $.godville.itemsValue() - parseInt(localStorage.getItem("itemsValue"));
    },
    enemy : function() {
    	return (
            $("#hk_monster_name").is(':visible')
            || ($("#opps > div.block_content > div:nth-child(1) > div > div > div.opp_n").length > 0)
        );
    },
    gold : function() {
        return parseInt($("#hk_gold_we > div.l_val").text().match(/\d+/)[0]);
    },
    enemyProgress : function() {
        return parseInt($("#news > div.block_content > div:nth-child(1) > div:nth-child(1) > div.p_bar.monster_pb > div").css("width"));
    },
    isBoss : function() {
        return ($("#o_info > div.block_content > div:nth-child(7) > div.l_val > a").length > 0)
    },
    mana : function() {
        var text = $("#cntrl > div.pbar.line > div.gp_val").text();
        return parseInt(text);
    },
    actItems : function() {
        return $("a.item_act_link_div");
    },
    useItem : function() {
        $.godville.actItems().click();
        $.godville.setItemUseCount();
    },
    charges : function() {
       	var text = $("#cntrl > div.acc_line.line > div.battery > span.acc_val").text();
        return parseInt(text);
    },
    city : function() {
      	return $("#hk_distance > div.l_val > a").text();
    },
    addMana : function() {
        $("#acc_links_wrap > div:nth-child(1) > a").click();
    },
    necromancy : function() {
        $("#cntrl1 > a:nth-child(3)").click();
    },
    addCharges : function() {
        $("#acc_links_wrap > div:nth-child(2) > a").click();
        $.godville.setAccumulateCount();
    },
    makeGood : function() {
        $("#cntrl1 > a.no_link.div_link.enc_link").click();
        $.godville.setHealCount();
    },
    commandDig : function() {
        $("#god_phrase").val("копай");
        $("#voice_submit").click();
        $.godville.setDigCount();
    },
    addSwitcher : function(text, callback, time) {
        var skills = $("#godvillebot");
        var element = $("<input type='button' value='" + text + "'>");
        skills.append(element);
        SwitcherButton(element, callback, time);
    },
    addWatcher : function(text, callback) {
        var watchers = $("#godvillestat");
        var element = $("<div>");
        watchers.append(element);
        Watcher(element, text, callback);
    },
    addPanelWatcher : function(panel, text, callback) {
        var css = {
            "background" : "rgba(161, 237, 194, 0.41)",
            "margin" : "-4px",
            "padding" : "4px"
        };
        var element = $("<div>").css(css);
        panel.append(element);
        Watcher(element, text, callback);
    },
    isHealNeeded : function() {
        return (
            // Если это просто противник, то хилить только при менее 15 здоровья
            $.godville.health().current < 15
            || (
                $.godville.isBoss() // Если противник босс, то хилить при менее 40% здоровья
                && (($.godville.health().current / $.godville.health().maximum) < 0.4)
            )
        );
    },
    //@todo хилить словами
    autoheal : function() {
        // Если персонаж мертв, воскрешаем
        if($.godville.health().current == 0) {
            $.godville.necromancy();
            return;
        }
        // Если нет врага, не лечим, пустая трата маны
        if (!$.godville.enemy()) {
            return;
        }
        // Если враг не босс и почти добит, тоже лечить не надо
        if (!($.godville.isBoss()) && $.godville.enemyProgress() > 70) {
            return;
        }
        // Если нет маны, есть заряды, жизни мало, то добавляем ману из заряда
        if (
            $.godville.mana() < 25
            && $.godville.charges() > 0
            && $.godville.isHealNeeded()
        ) {
            $.godville.addMana();
            return;
        }
        // Если есть мана, то хилим
        if (
            $.godville.mana() > 24
            && $.godville.isHealNeeded()
        ) {
            $.godville.makeGood();
        }
    },
    autodig : function() {
        if(!($.godville.enemy()) && !($.godville.city()) && $.godville.health().current > 40 && $.godville.mana() > 40 && $.godville.charges() > 0)
        {
            $.godville.commandDig();
        }
    },
    autoactitem : function() {
        $.godville.actItems().each(function() {
            // Если предмет делает золотой кирпич, то активируем его в городе, когда есть мана и 3к голды
            if(
                this.title.indexOf("кирпич") >= 0
                && $.godville.city()
                && $.godville.mana() > 49
                && $.godville.gold() > 3000
            ) {

            }
        });
    },
    autoaccumulate : function() {
        if($.godville.city() && $.godville.mana() == 100 && $.godville.charges() == 0) {
            $.godville.addCharges();
        }
    },
    init : function() {
        if($("#m_hero > a").attr("href") == "/superhero") {
             window.location.href = "/superhero";
        }
        //@todo сделать поддержку блоков на арене
        if(!$("#godvillebot").length) {
            $("#right_block").append('<div class="block"><div class="block_h"><div class="block_title">Автоматизация</div></div><div class="block_content" id="godvillebot" style="text-align: center"></div>');
            $("#right_block").append('<div class="block"><div class="block_h"><div class="block_title">Статистика</div></div><div class="block_content" id="godvillestat"></div>');
            $.godville.addSwitcher("Автохил", $.godville.autoheal, 1000);
            $.godville.addSwitcher("Раскопки", $.godville.autodig, 60000);
            $.godville.addSwitcher("Предметы", $.godville.autoactitem, 1000);
            $.godville.addSwitcher("Аккумулятор", $.godville.autoaccumulate, 1000);
            $.godville.addWatcher("Автолечение", $.godville.getHealCount);
            $.godville.addWatcher("Автораскопок", $.godville.getDigCount);
            $.godville.addWatcher("Использовано предметов", $.godville.getItemUseCount);
            $.godville.addWatcher("Аккумулировно маны", $.godville.getAccumulateCount);
            $.godville.addPanelWatcher($("#equipment"), "Бонус шмоток за сегодня", $.godville.getItemsProfit);
        }
        setTimeout(function() { $.godville.init(); }, 1000);
    }
};

//@todo Разделить саму кнопку и циклы
SwitcherButton = function(self, callback, time) {
    var red = "rgba(190, 19, 19, 1)";
    var green = "rgba(49, 174, 84, 1)";
    self.css({"margin-right": "3px", "margin-top": "3px", "color": red});
    $.extend(self, {
        _timeout : false,
        _process : false,
        _callback : callback,
        _timeoutFun : function() {
            self._timeout = setTimeout(function() {
				self._callback();
                self._timeoutFun();
			}, time);
        }
    });
    self.click(function() {
        if(self._timeout) {
            //turn off
            clearTimeout(self._timeout);
            self._timeout = false;
            self.css("color", red);
            localStorage.setItem(self.val(), false);
        } else {
            //turn on            
            self._timeoutFun();
            self.css("color", green);
            localStorage.setItem(self.val(), true);
        }
    });
    if(localStorage.getItem(self.val()) == "true") {
        self.click();
    }
    return self;
};

//@todo Сделать возможность "деструктора"
Watcher = function(self, text, callback) {
    $.extend(self, {
        _text : text,
        _callback : callback,
        _timeoutFun : function() {
            var value = self._callback();
            self.text(self._text + ": " + (value ? value : 0));
            setTimeout(function() {
                self._timeoutFun();
            }, 1000);
        }
    });
    self._timeoutFun();
};

EquipmentMemory = function() {
    self = {
        getItemCache : function(i) {
            localStorage.getItem("eqcache_" + i);
        },
        setItemCache : function(i, val) {
            localStorage.setItem("eqcache_" + i, val);
        },
        init : function() {
            $("head").append('<link rel="stylesheet" href="http://code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">');
            $.getScript("http://yastatic.net/jquery-ui/1.11.1/jquery-ui.min.js")
                .done(function() {
                    $(document).tooltip({
                        items: ".eq_line",
                        position: {
                            at: "left bottom-15"
                        }
                    });
                });
            $(".eq_line").each(function() { $(this).css("cursor", "pointer"); });
            $(".eq_line").hover(
                function() { $(this).css("background", "white") },
                function() { $(this).css("background", "inherit") }
            );
            return self;
        },
        run : function() {
            $(".eq_line").each(function(i) {
                var cache = self.getItemCache(i);
                var item = $(this);
                var caption = item.find(".eq_name").text();
                var level = item.find(".eq_level").text();
                var itemText = caption + ' ' + level;
                if (!cache || (cache != itemText)) {
                    item.attr("title", cache);
                    self.setItemCache(i, itemText);
                }
            });
            setTimeout(function() { self.run(); }, 1000);
        }
    };
    return self;
};

// Init
$(document).ready(function() {
    setTimeout(function() {
        $.godville.init();
        EquipmentMemory().init().run();
    }, 1000);
});