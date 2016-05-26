var User = function() {
	var score = 0,
		currentCombo = 0,
		maxCombo = 0,
		isSuccessPlay = false,
		defaultAddScore = {
			MISS : -300,
			BAD  : -20,
			GOOD :  20,
			AWESOME : 80,
			PERFECT : 404
		},
		comboBonus = 200;

	return {
		setIsSuccessPlay: function( boolSuccess ) {
			isSuccessPlay = boolSuccess;
		},

		incrementScore: function(judgeStatus) {
			if( isSuccessPlay ) {
				score += defaultAddScore[judgeStatus] + comboBonus * currentCombo++;
				if(currentCombo > maxCombo) maxCombo++;
			} else {
				currentCombo = 0;
				score += defaultAddScore[judgeStatus];
				if(score < 0 ) score = 0;
			}
		},
		getCurrentCombo : function () {
			return currentCombo;
		},
		getMaxCombo : function () {
			return maxCombo;
		},

		resetData : function() {
			score = 0;
			currentCombo = 0;
			maxCombo = 0;
			isSuccessPlay = false;
		},

		getUA : function () {
			var ua = navigator.userAgent;
			if( ua.indexOf( 'iPhone' ) > 0 || ua.indexOf( 'iPod' ) > 0 || ua.indexOf( 'Android' ) > 0 && ua.indexOf( 'Mobile' ) > 0 )	return 'sp';
			if( ua.indexOf( 'iPad' ) > 0 || ua.indexOf( 'Android' ) > 0 ) return 'tab';
			if( ua.indexOf( 'MSIE' ) > 0  || ua.indexOf( 'Trident' ) > 0 ) return 'ie';
			return 'other';
		},

		getUserScore : function() {
			return score;
		}
	};
};

module.exports = User;
