
	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();

	var ua = (function() {
		
		if (userAgent.indexOf('opr') != -1) {
		  return 'opera';
		} else if (userAgent.indexOf('msie') != -1) {
			// IEの場合は判定
			if (appVersion.indexOf("msie 6.") != -1) {
				return 'ie6';
			} else if (appVersion.indexOf("msie 7.") != -1) {
				return 'ie7';
			} else if (appVersion.indexOf("msie 8.") != -1) {
				return 'ie8';
			} else if (appVersion.indexOf("msie 9.") != -1) {
				return 'ie9';
			} else {
				return 'ie';
			}
		} else if (userAgent.indexOf('chrome') != -1) {
			return 'chrome';
		} else if (userAgent.indexOf('safari') != -1) {
			return 'safari';
		} else if (userAgent.indexOf('gecko') != -1) {
			return 'gecko';
		} else {
			return false;
		}
	}());

console.log(ua);
	// 要素の削除
	if (ua =='ie7' || ua == 'ie6' || ua == 'ie8' || ua == 'opera') {
		window.uaError = true;
		$(function(){
			console.log('GWEGWEG');
			$("#enchant-stage").remove();
			$('.ie_alert').show().css("text-aline", 'center');
		});
	}
