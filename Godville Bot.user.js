// ==UserScript==
// @name         Godville Bot
// @namespace    http://godville.net/
// @version      0.323
// @description  Godville Automatic Stuff
// @author       UnstableFractal
// @match        http://godville.net/*
// @updateUrl    https://github.com/smsteel/godvillebot/raw/master/Godville%20Bot.user.js
// ==/UserScript==

// API
$.godville = {
    setCounter : function(name) {
        count = parseInt(localStorage.getItem(name));
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
        return localStorage.getItem("itemusecount")
    },
    setAccumulateCount : function() {
        $.godville.setCounter("accumulatecount");
    },
    getAccumulateCount : function() {
        return localStorage.getItem("accumulatecount")
    },
    health : function() {
        text = $("#hk_health > div.l_val").text().split('/');
        return {
            current : parseInt(text[0]),
            maximum : parseInt(text[1])
        }
    },
    enemy : function() {
    	exists = $("#hk_monster_name").is(':visible');
        if(exists) {   
            return $("#hk_monster_name > div.l_val").text();
        } else {
            return false;
        }
    },
    isBoss : function() {
        return ($("#o_info > div.block_content > div:nth-child(7) > div.l_val > a").length > 0)
    },
    mana : function() {
        text = $("#cntrl > div.pbar.line > div.gp_val").text();
        return parseInt(text);
    },
    actItems : function() {
        return $(".item_act_link_div");
    },
    useItem : function() {
        $.godville.actItems().click();
        $.godville.setItemUseCount();
    },
    charges : function() {
       	text = $("#cntrl > div.acc_line.line > div.battery > span.acc_val").text();
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
        skills = $("#godvillebot");
        element = $("<input type='button' value='" + text + "'>");
        skills.append(element);
        SwitcherButton(element, callback, time);
    },
    addWatcher : function(text, callback) {
        watchers = $("#godvillestat");
        element = $("<div>");
        watchers.append(element);
        Watcher(element, text, callback);
    },
    autoheal : function() {
        if($.godville.health().current == 0) {
            $.godville.necromancy();
        } else {
            if ($.godville.health().current < 15 && $.godville.mana() > 24) {
                $.godville.makeGood();
            }
            if ($.godville.health().current < 15 && $.godville.mana() < 25 && $.godville.charges() > 0) {
                $.godville.addMana();
            }
            if ($.godville.enemy() && $.godville.isBoss() && $.godville.health.current < 45 && $.godville.mana() > 24) {
                $.godville.makeGood();
            }
            if ($.godville.enemy() && $.godville.isBoss() && $.godville.health.current < 45 && $.godville.mana() < 25 && $.godville.charges() > 0) {
                $.godville.addMana();
            }
        }
    },
    autodig : function() {
        if(!($.godville.enemy()) && !($.godville.city()) && $.godville.health().current > 40 && $.godville.mana() > 40 && $.godville.charges() > 0)
        {
            $.godville.commandDig();
        }
    },
    autoactitem : function() {
        if($.godville.mana() > 49 && $.godville.health().current() > 49 && $.godville.actItems().length > 0) {
            $.godville.useItem();
        }
        if($.godville.city() && $.godville.mana() < 50 && $.godville.charges() > 0 && $.godville.actItems().length > 0) {
            $.godville.addMana();
            setTimeout(function() { $.godville.useItem(); }, 500);
        }
    },
    autoaccumulate : function() {
        if($.godville.mana() == 100 && $.godville.charges() == 0 && $.godville.health().current > 40) {
            $.godville.addCharges();
        }
    },
    init : function() {
        if($("#m_hero > a").attr("href") == "/superhero") {
             window.location.href = "/superhero";
        }
        if(!$("#godvillebot").length) {
            $("#right_block").append('<div class="block"><div class="block_h"><div class="block_title">Автоматизация</div></div><div class="block_content" id="godvillebot" style="text-align: center"></div>');
            $("#right_block").append('<div class="block"><div class="block_h"><div class="block_title">Статистика</div></div><div class="block_content" id="godvillestat"></div>');
            $.godville.addSwitcher("Автохил", $.godville.autoheal, 1000);
            $.godville.addSwitcher("Раскопки", $.godville.autodig, 60000);
            $.godville.addSwitcher("Предметы", $.godville.autoactitem, 60000);
            $.godville.addSwitcher("Аккумулятор", $.godville.autoaccumulate, 1000);
            $.godville.addWatcher("Автолечение", $.godville.getHealCount);
            $.godville.addWatcher("Автораскопок", $.godville.getDigCount);
            $.godville.addWatcher("Использовано предметов", $.godville.getItemUseCount);
            $.godville.addWatcher("Аккумулировно маны", $.godville.getAccumulateCount);
        }
        setTimeout(function() { $.godville.init(); }, 1000);
    }
};

SwitcherButton = function(self, callback, time) {
    red = "rgba(190, 19, 19, 1)";
    green = "rgba(49, 174, 84, 1)";
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
}

Watcher = function(self, text, callback) {
    $.extend(self, {
        _text : text,
        _callback : callback,
        _timeoutFun : function() {
            value = self._callback();
            self.text(self._text + ": " + (value ? value : 0));
            setTimeout(function() {
                self._timeoutFun();
            }, 1000);
        }
    });
    self._timeoutFun();
}

// Init
$(document).ready(function() {
    setTimeout(function() { $.godville.init(); }, 1000);
});