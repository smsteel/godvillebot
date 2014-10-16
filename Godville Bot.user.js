// ==UserScript==
// @name         Godville Bot
// @namespace    http://godville.net/
// @version      0.300
// @description  Godville Automatic Stuff
// @author       UnstableFractal
// @match        http://godville.net/superhero
// @updateUrl    https://github.com/smsteel/godvillebot/raw/master/Godville%20Bot.user.js
// ==/UserScript==

// API
$.godville = {
    healCount : 0,
    digCount : 0,
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
    mana : function() {
        text = $("#cntrl > div.pbar.line > div.gp_val").text();
        return parseInt(text);
    },
    actItems : function() {
        return $(".item_act_link_div");
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
    addCharges : function() {
        $("#acc_links_wrap > div:nth-child(2) > a").click();
    },
    makeGood : function() {
        $("#cntrl1 > a.no_link.div_link.enc_link").click();
    },
    commandDig : function() {
        $("#god_phrase").val("копай");
        $("#voice_submit").click();
    },
    addSwitcher : function(text, callback, time) {
        skills = $("#godvillebot");
        element = $("<input type='button' value='" + text + "'>");
        skills.append(element);
        SwitcherButton(element, callback, time);
    },
    autoheal : function() {
        if($.godville.health().current < 10 && $.godville.mana() > 24) {
            $.godville.makeGood();
            $.godville.healCount += 1;
        }
        if($.godville.health().current < 10 && $.godville.mana() < 25 && $.godville.charges() > 0) {
            $.godville.addMana();
        }
    },
    autodig : function() {
        if(!($.godville.enemy()) && !($.godville.city()) && $.godville.health().current > 40 && $.godville.mana() > 40 && $.godville.charges() > 0)
        {
            $.godville.commandDig();
            $.godville.digCount += 1;
        }
    },
    autoactitem : function() {
        if($.godville.mana() > 49 && $.godville.health().current() > 49 && $.godville.actItems().length > 0) {
            $.godville.actItems().click();
        }
        if($.godville.city() && $.godville.mana() < 50 && $.godville.charges() > 0 && $.godville.actItems().length > 0) {
            $.godville.addMana();
            setTimeout(function() { $.godville.actItems().click(); }, 500);
        }
    },
    autoaccumulate : function() {
        if($.godville.mana() == 100 && $.godville.charges() == 0 && $.godville.health().current > 40) {
            $.godville.addCharges();
        }
    },
    init : function() {
        if(!$("#godvillebot").length) {
            $("#right_block").append('<div class="block"><div class="block_h"><span class="l_slot"> <span class="b_handle m_hover" style="display: none;" title="Переместить блок">●</span> </span><div class="block_title">Автоматизация</div><span class="r_slot"><div border="0" align="middle" class="bar_spinner spinner_img" style="display: none;"></div><span class="h_min m_hover" style="display: none;">↑</span></span></div><div class="block_content" id="godvillebot" style="text-align: center"></div>');
            $.godville.addSwitcher("Автохил", $.godville.autoheal, 1000);
            $.godville.addSwitcher("Раскопки", $.godville.autodig, 60000);
            $.godville.addSwitcher("Предметы", $.godville.autoactitem, 60000);
            $.godville.addSwitcher("Аккумулятор", $.godville.autoaccumulate, 1000);
        }
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
    if(localStorage.getItem(self.val())) {
        self.click();
    }
    return self;
}

// Init
$(document).ready(function() {
    setTimeout(function() { $.godville.init(); }, 1000);
});