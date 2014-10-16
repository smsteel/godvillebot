// ==UserScript==
// @name         Godville Bot
// @namespace    http://godville.net/
// @version      0.1
// @description  Godville Automatic Stuff
// @author       UnstableFractal
// @match        http://godville.net/superhero
// ==/UserScript==

// API
$.godville = {
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
    charges : function() {
       	text = $("#cntrl > div.acc_line.line > div.battery > span.acc_val").text();
        return parseInt(text);
    },
    city : function() {
      	return $("#hk_distance > div.l_val > a").text();
    },
    addCharges : function() {
        $("#acc_links_wrap > div:nth-child(1) > a").click();
    },
    makeGood : function() {
        $("#cntrl1 > a.no_link.div_link.enc_link").click();
    },
    commandDig : function() {
        $("#god_phrase").val("копать");
        $("#voice_submit").click();
    },
    addSkill : function(text) {
        skills = $("#s_b_id > ul");
        element = $("<li><button>" + text + "</button></li>");
        skills.append(element);
        return element.find("button");
    },
    autoheal : function() {
		if($.godville.health().current < 10 && $.godville.mana() > 24) {
			$.godville.makeGood();
        }
		if($.godville.health().current < 10 && $.godville.mana() < 25 && $.godville.charges() > 0) {
            $.godville.addCharges();
		}
    },
    autodig : function() {
        if(!($.godville.enemy()) && !($.godville.city()) && $.godville.health().current > 40 && $.godville.mana() > 40 && $.godville.charges() > 0)
        {
            $.godville.commandDig();
        }
    }
};

SwitcherButton = function(self, callback, time) {
    red = "rgba(255, 0, 0, 0.44)";
    green = "rgba(0, 255, 71, 0.44)";
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
            self.css("background", red);
        } else {
            //turn on            
            self._timeoutFun();
            self.css("background", green);
        }
    });
    self.css("background", red);
    self.css("border", 0);
    return self;
}

// Init
$(document).ready(function() {
    setTimeout(function() {
        healbutton = new SwitcherButton(
            $.godville.addSkill("Автохил"),
            $.godville.autoheal,
            1000
        );
        digbutton = new SwitcherButton(
            $.godville.addSkill("Раскопки"),
            $.godville.autodig,
            20000
        );
    }, 1000);
    $.getScript('http://yastatic.net/jquery/cookie/1.0/jquery.cookie.min.js');
});