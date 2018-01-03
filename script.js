$(document).ready(function () {
	$("#menu_toggle").click(function (e) {
		e.preventDefault();
		$("#wrapper").toggleClass("active");
	});
});

var hw8 = angular.module('hw8', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngStorage', 'angularUtils.directives.dirPagination', 'angularMoment']);

hw8.filter('titleCase', function () {
	return function (input) {
		input = input || '';
		return input.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	};
});

hw8.filter('filterByState', function () {
	return function (legislators, state_selected) {
		//console.log(state_selected)
		if (state_selected === "All States")
			return legislators;
		if (!state_selected)
			return legislators;

		return legislators.filter(function (legislator) {
			return legislator.state_name === state_selected;
		});
	};
});

hw8.filter('filterByHouse', function () {
	return function (legislators) {
		return legislators.filter(function (legislator) {
			return legislator.chamber === "house";
		});
	};
});

hw8.filter('filterBySenate', function () {
	return function (legislators) {
		return legislators.filter(function (legislator) {
			return legislator.chamber === "senate";
		});
	};
});

hw8.filter('filterByHouseCommittee', function () {
	return function (committees) {
		return committees.filter(function (committee) {
			return committee.chamber === "house";
		});
	};
});

hw8.filter('filterBySenateCommittee', function () {
	return function (committees) {
		return committees.filter(function (committee) {
			return committee.chamber === "senate";
		});
	};
});

hw8.filter('filterByJointCommittee', function () {
	return function (committees) {
		return committees.filter(function (committee) {
			return committee.chamber === "joint";
		});
	};
});

hw8.controller('page', ['$scope', '$window', '$document', '$http', '$sce', '$filter', 'moment', '$localStorage', function (scope, window, document, http, sce, filter, moment, localStorage) {
	delete localStorage.legislators;
	delete localStorage.bills;
	delete localStorage.committees;

	scope.$storage = localStorage;
	scope.$storage = localStorage.$default({
		legislators: [],
		bills: {
			active_bills: [],
			new_bills: []
		},
		committees: [],
		legislators_favorite: [],
		bills_favorite: [],
		committees_favorite: []
	});
	scope.selectedBill = {};
	scope.selectedLegislator = {};
	scope.selectedCommittee = {};
	scope.selectedFavoriteBill = {};
	scope.selectedFavoriteLegislator = {};
	scope.selectedFavoriteCommittee = {};

	scope.committees_favorites_star = 1;
	scope.other_favorite_stars = 1;

	http({
		method: 'GET',
		url: '/helloworld.php?only_legislators=true'
	}).then(function successCallback(response) {
		console.log(response.data.length);
		localStorage.legislators = response.data.results;
	}, function errorCallback(response) {
		console.log(response)
	});
	
	http({
		method: 'GET',
		url: '/helloworld.php?only_active_bills=true'
	}).then(function successCallback(response) {
		console.log(response.data.results.length);
		localStorage.bills.active_bills = response.data.results;
	}, function errorCallback(response) {
		console.log(response)
	});
	
	http({
		method: 'GET',
		url: '/helloworld.php?only_new_bills=true'
	}).then(function successCallback(response) {
		console.log(response.data.results.length);
		localStorage.bills.new_bills = response.data.results;
	}, function errorCallback(response) {
		console.log(response)
	});
	
	http({
		method: 'GET',
		url: '/helloworld.php?only_committees=true'
	}).then(function successCallback(response) {
		console.log(response.data.results.length);
		localStorage.committees = response.data.results;
	}, function errorCallback(response) {
		console.log(response)
	});

	scope.states = ['All States', 'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'US Virgin Islands', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
	scope.option = 0;

	scope.changeView = function (option) {
		scope.option_section_mapping = [legislators_section, bills_section, committees_section, favorites_section];
		angular.element(scope.option_section_mapping[scope.option]).hide();
		scope.option = option;
		angular.element(scope.option_section_mapping[scope.option]).show();
	}

	scope.legislators = {
		getLegislator: function (bioguide_id) {
			for (var i = 0; i < localStorage.legislators.length; i++) {
				if (localStorage.legislators[i].bioguide_id === bioguide_id)
					return localStorage.legislators[i];
			}
			console.log("shit happened in getLegislator");
			return null;
		},

		getParty: function (party) {
			if (!party) return "NA";
			return sce.trustAsHtml('<img class="legislators_party" src="static/' + party.toString() + '.png" width="20" height="20"/>')
		},
		
		getName: function (first_name, last_name) {
			return sce.trustAsHtml('<div class="legislators_name">' + (last_name ? last_name + ", " : "") + (first_name ? first_name : "") + '</div>')
		},
		
		getChamber: function (chamber) {
			if (!chamber) return "NA";
			return sce.trustAsHtml('<img class="legislators_chamber" src="static/' + chamber.toString() + '.png" width="20" height="20"/>' + filter('titleCase')(chamber.toString()))
		},
		
		getDistrict: function (district) {
			if (!district) return "NA";
			return sce.trustAsHtml('District ' + district.toString());
		},
		
		getState: function (state) {
			if (!state) return "NA";
			return sce.trustAsHtml(state);
		},

		view_details_legislator_img: function (bioguide_id) {
			if (!bioguide_id) return sce.trustAsHtml('<div class="view_details_legislator_img">NA</div>');
			//return ('<img class="legislator_img" src="https://theunitedstates.io/images/congress/original/' + bioguide_id + '.jpg" alt="legislator image"/>')
			return ('<img class="legislator_img" src="https://theunitedstates.io/images/congress/225x275/' + bioguide_id + '.jpg" alt="legislator image"/>')
		},

		favorites_legislator_img: function (bioguide_id) {
			//return ('<img class="favorites_legislator_img" src="https://theunitedstates.io/images/congress/original/' + bioguide_id + '.jpg" alt="legislator image"/>')
			if (!bioguide_id) return sce.trustAsHtml('<div class="favorites_legislator_img">NA</div>');
			return ('<img class="favorites_legislator_img" src="https://theunitedstates.io/images/congress/225x275/' + bioguide_id + '.jpg" alt="legislator image"/>')
		},

		view_details_name: function (title, last_name, first_name) {
			var text = (title ? title + ". " : "") + (last_name ? last_name + ", " : "") + (first_name ? first_name : "");
			return sce.trustAsHtml('<div class="view_details_name">' + text + '</div>');
		},

		favorites_name: function (last_name, first_name) {
			var text = (last_name ? last_name + ", " : "") + (first_name ? first_name : "");
			return sce.trustAsHtml('<div class="view_details_name">' + text + '</div>');
		},

		view_details_email: function (email) {
			if (!email) return sce.trustAsHtml('<div class="view_details_email">NA</div>');
			return sce.trustAsHtml('<a target="_blank" class="view_details_email" href="mailto:' + email + '">' + email + '</a>');

		},

		view_details_chamber: function (chamber) {
			if (!chamber) return sce.trustAsHtml('<div class="view_details_chamber">NA</div>');
			return sce.trustAsHtml('<div class="view_details_chamber">Chamber: ' + (chamber ? filter('titleCase')(chamber.toString()) : "NA") + '</div>');
		},

		view_details_phone: function (phone) {
			if (!phone) return sce.trustAsHtml('<div class="view_details_phone">NA</div>');
			return sce.trustAsHtml('<div>Contact: <a target="_blank" href="tel:' + phone + '" class="view_details_phone">' + (phone ? phone : "NA") + '</a></div>');
		},

		view_details_party: function (party) {
			if (!party) return sce.trustAsHtml('<div class="view_details_party>NA</div>');
			return sce.trustAsHtml('<img class="view_details_party" src="static/' + party.toString() + '.png" />' + '<div>' + (party == "D" ? "Democrat" : (party == "R" ? "Republican" : "Independant")) + '</div>');
		},

		favorites_party: function (party) {
			if (!party) return sce.trustAsHtml('<div class="favorites_party">NA</div>');
			return sce.trustAsHtml('<img class="favorites_party" src="static/' + party.toString() + '.png" />');
		},

		view_details_start_term: function (term_start) {
			if (!term_start) return sce.trustAsHtml('<div class="view_details_start_term">NA</div>');
			var date = moment(term_start, "YYYY-MM-DD").format('ll');
			return sce.trustAsHtml('<div class="view_details_start_term">' + date.toString() + '</div>');
		},
		
		view_details_end_term: function (term_end) {
			if (!term_end) return sce.trustAsHtml('<div class="view_details_end_term">NA</div>');
			var date = moment(term_end, "YYYY-MM-DD").format('ll');
			return sce.trustAsHtml('<div class="view_details_end_term">' + date.toString() + '</div>');
		},
		
		view_details_term: function (term_start, term_end) {
			if (!term_end || !term_start) return sce.trustAsHtml('<div class="view_details_term">NA</div>');
			var x = moment().diff(moment(term_start, "YYYY-MM-DD"), 'days');
			var y = moment(term_end, "YYYY-MM-DD").diff(moment(term_start, "YYYY-MM-DD"), 'days');
			var percentage_completed = Math.round(x / y * 100);
			return sce.trustAsHtml('<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="' + percentage_completed + '" aria-valuemin="0" aria-valuemax="100" style="width:' + percentage_completed + '%">' + percentage_completed + '%</div></div>');
		},
		
		view_details_office: function (office) {
			if (!office) return sce.trustAsHtml('<div class="view_details_office">NA</div>');
			return sce.trustAsHtml('<div class="view_details_office">' + office + '</div>');
		},
		
		view_details_state: function (state_name) {
			if (!state_name) return sce.trustAsHtml('<div class="view_details_state">NA</div>');
			return sce.trustAsHtml('<div class="view_details_state">' + state_name + '</div>');
		},
		
		view_details_fax: function (fax) {
			if (!fax) return sce.trustAsHtml('<div class="view_details_fax">NA</div>');
			return sce.trustAsHtml('<a target="_blank" href="fax:' + fax + '" class="view_details_fax">' + fax + '</a>');
		},
		
		view_details_birthday: function (birthday) {
			if (!birthday) return sce.trustAsHtml('<div class="view_details_birthday">NA</div>');
			return sce.trustAsHtml('<div class="view_details_birthday">' + moment(birthday, "YYYY-MM-DD").format('ll').toString() + '</div>');
		},
		
		view_details_social_links: function (website, twitter_id, facebook_id) {
			var web = "",
				fb = "",
				tw = "";
			if (website)
				web = '<a href="' + website + '" target="_blank"><img class="view_details_social_links_website" src="static/w.png"/></a>';
			if (twitter_id)
				tw = '<a href="http://www.twitter.com/' + twitter_id + '" target="_blank"><img class="view_details_social_links_twitter" src="static/t.png"/></a>';
			if (facebook_id)
				fb = '<a href="http://www.facebook.com/' + facebook_id + '" target="_blank"><img class="view_details_social_links_facebook" src="static/f.png"/></a>';
			if (!(tw + fb + web).trim().length) return "NA";
			return '<div class="view_details_social_links">' + (tw + fb + web) + '</div>';
		},
		
		handleFavButtonClick: function () {
			if (scope.isFavorited('legislator', scope.selectedLegislator.bioguide_id)) {
				scope.removeFromFavorites('legislator', scope.selectedLegislator.bioguide_id);
				scope.selectedLegislator.favButtonStyle = {
					'background': 'none'
				};
			} else {
				scope.addToFavorites('legislator', scope.selectedLegislator.bioguide_id, scope.selectedLegislator);
				scope.selectedLegislator.favButtonStyle = {
					'background': 'yellow'
				};
			}
		},
		
		legislator_view_details: function (bioguide_id) {
			http({
				method: 'GET',
				url: '/helloworld.php?bioguide_id_bills=' + bioguide_id
			}).then(function successCallback(response) {
				console.log(response.data.results.length);
				scope.selectedLegislatorBills = response.data.results;
			}, function errorCallback(response) {
				console.log(response)
			});

			http({
				method: 'GET',
				url: '/helloworld.php?bioguide_id_committees=' + bioguide_id
			}).then(function successCallback(response) {
				console.log(response.data.results.length);
				scope.selectedLegislatorCommittees = response.data.results;
				scope.selectedLegislator = scope.legislators.getLegislator(bioguide_id);
				scope.selectedLegislator.favButtonStyle = {
					'background': scope.isFavorited('legislator', bioguide_id) ? 'yellow' : 'none'
				};
				setTimeout(function () {
					angular.element(favorites_section).hide();
					angular.element(legislator_carousel).carousel(0);
					scope.option = 0;
					angular.element(legislators_section).show();
					angular.element(legislator_carousel).carousel(1);
				}, 500);
			}, function errorCallback(response) {
				console.log(response)
			});
		},

		legislator_carousel_back: function () {
			scope.selectedLegislatorCommittees = [];
			scope.selectedLegislatorBills = [];
			angular.element(legislator_carousel).carousel(0);
		}
	};

	scope.bills = {
		getBill: function (bill_id) {
			for (var i = 0; i < localStorage.bills.active_bills.length; i++) {
				if (localStorage.bills.active_bills[i].bill_id === bill_id)
					return localStorage.bills.active_bills[i];
			}
			for (var i = 0; i < localStorage.bills.new_bills.length; i++) {
				if (localStorage.bills.new_bills[i].bill_id === bill_id)
					return localStorage.bills.new_bills[i];
			}
			console.log("shit happened in getBill");
			return null;
		},
		
		getBillId: function (bill_id) {
			if (!bill_id) return sce.trustAsHtml('<div class="bills_bill_id">NA</div>');
			return sce.trustAsHtml('<div class="bills_bill_id">' + filter('uppercase')(bill_id) + '</div>');
		},
		
		getBillType: function (bill_type) {
			if (!bill_type) return sce.trustAsHtml('<div class="bills_bill_type">NA</div>');
			return sce.trustAsHtml('<div class="bills_bill_type">' + filter('uppercase')(bill_type) + '</div>');
		},
		
		getTitle: function (official_title) {
			if (!official_title) return sce.trustAsHtml('<div class="bills_official_title">NA</div>');
			return sce.trustAsHtml('<div class="bills_official_title">' + official_title + '</div>');
		},
		
		getChamber: function (chamber) {
			if (!chamber) return sce.trustAsHtml('<div class="bills_chamber">NA</div>');
			return scope.legislators.getChamber(chamber);
		},
		
		getIntroducedOn: function (introduced_on) {
			if (!introduced_on) return sce.trustAsHtml('<div class="bills_introduced_on">NA</div>');
			return sce.trustAsHtml('<div class="bills_introduced_on">' + introduced_on + '</div>');
		},
		
		getSponsor: function (title, first_name, last_name) {
			return scope.legislators.view_details_name(title, last_name, first_name);
		},

		getPdf: function () {
			/*<div class="bills_pdf"><object type="application/pdf" data="bills.getPdf()"><p>PDF cannot be displayed on this browser</p> </object></div><embed src="http://example.com/the.pdf" width="500" height="375" type='application/pdf'><iframe src="http://docs.google.com/gview?url=http://example.com/mypdf.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>*/
			var bill_pdf = scope.selectedBill.last_version ? (scope.selectedBill.last_version.urls ? (scope.selectedBill.last_version.urls.pdf ? scope.selectedBill.last_version.urls.pdf : '') : '') : '';
			//console.log(bill_pdf);
			if (bill_pdf.trim().length)
				return '<div class="bill_pdf"><object type="application/pdf" data="' + bill_pdf + '"><p>PDF cannot be displayed on this browser</p> </object></div><embed src="' + bill_pdf + '" type="application/pdf" /><iframe src="http://docs.google.com/gview?url=' + bill_pdf + '&embedded=true" frameborder="0"></iframe>';
		},

		getPdfLink: function () {
			/*<div class="bills_pdf"><object type="application/pdf" data="bills.getPdf()"><p>PDF cannot be displayed on this browser</p> </object></div><embed src="http://example.com/the.pdf" width="500" height="375" type='application/pdf'><iframe src="http://docs.google.com/gview?url=http://example.com/mypdf.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>*/
			var bill_pdf = scope.selectedBill.last_version ? (scope.selectedBill.last_version.urls ? (scope.selectedBill.last_version.urls.pdf ? scope.selectedBill.last_version.urls.pdf : '') : '') : '';
			console.log(bill_pdf);
			return bill_pdf;
		},

		view_details_bill_id: function (bill_id) {
			return this.getBillId(bill_id);
		},

		view_details_title: function (official_title) {
			return this.getTitle(official_title);
		},

		view_details_bill_type: function (bill_type) {
			return this.getBillType(bill_type);
		},

		view_details_sponsor: function (title, first_name, last_name) {
			return this.getSponsor(title, first_name, last_name);
		},

		view_details_chamber: function (chamber) {
			if (!chamber) return sce.trustAsHtml('<div class="view_details_chamber">NA</div>');
			return sce.trustAsHtml('<div class="view_details_chamber">' + filter('titleCase')(chamber) + '</div>');
		},

		view_details_status: function (active) {
			if (active) return sce.trustAsHtml('<div class="view_details_status">Active</div>');
			return sce.trustAsHtml('<div class="view_details_status">New</div>');
		},

		view_details_introduced_on: function (introduced_on) {
			if (!introduced_on) return sce.trustAsHtml('<div class="view_details_introduced_on">NA</div>');
			return sce.trustAsHtml('<div class="view_details_introduced_on">' + moment(introduced_on, "YYYY-MM-DD").format('ll').toString() + '</div>');
		},

		view_details_congress_url: function () {
			var congress_url = scope.selectedBill.urls ? (scope.selectedBill.urls.congress) : null;
			if (!congress_url) return sce.trustAsHtml('<div class="view_details_congress_url">NA</div>');
			return sce.trustAsHtml('<a target="_blank" href="' + congress_url + '" class="view_details_congress_url">URL</a>');
		},

		view_details_bill_url: function () {
			var bill_url = scope.selectedBill.last_version ? scope.selectedBill.last_version.urls ? scope.selectedBill.last_version.urls.pdf ? scope.selectedBill.last_version.urls.pdf : null : null : null;
			if (!bill_url) return sce.trustAsHtml('<div class="view_details_bill_url">NA</div>');
			return sce.trustAsHtml('<a target="_blank" href="' + bill_url + '" class="view_details_congress_url">Link</a>');
		},

		bill_view_details: function (bill_id) {
			console.log(bill_id);
			scope.selectedBill = scope.bills.getBill(bill_id);
			scope.selectedBill.favButtonStyle = {
				'background': scope.isFavorited('bill', bill_id) ? 'yellow' : 'none'
			};
			setTimeout(function () {
				angular.element(favorites_section).hide();
				angular.element(bill_carousel).carousel(0);
				scope.option = 1;
				angular.element(bills_section).show();
				angular.element(bill_carousel).carousel(1);
			}, 500);

		},
		bill_carousel_back: function () {
			angular.element(bill_carousel).carousel(0);
		},
		
		handleFavButtonClick: function () {
			if (scope.isFavorited('bill', scope.selectedBill.bill_id)) {
				scope.removeFromFavorites('bill', scope.selectedBill.bill_id);
				scope.selectedBill.favButtonStyle = {
					'background': 'none'
				};
			} else {
				scope.addToFavorites('bill', scope.selectedBill.bill_id, scope.selectedBill);
				scope.selectedBill.favButtonStyle = {
					'background': 'yellow'
				};
			}
		},
	};

	scope.committees = {
		getChamber: function (chamber) {
			if (!chamber) return "NA";
			return scope.legislators.getChamber(chamber);
		},
		
		getCommitteeId: function (committee_id) {
			if (!committee_id) return "NA";
			return committee_id;
		},
		
		getName: function (name) {
			if (!name) return "NA";
			return name;
		},
		
		getParentCommittee: function (parent_committee_id) {
			if (!parent_committee_id) return "NA";
			return parent_committee_id;
		},
		
		getContact: function (phone) {
			if (!phone) return "NA";
			return phone;
		},
		
		getOffice: function (office) {
			if (!office) return "NA";
			return office;
		},
		
		getCommittee: function (committee_id) {
			for (var i = 0; i < localStorage.committees.length; i++) {
				if (localStorage.committees[i].committee_id === committee_id)
					return localStorage.committees[i];
			}

			console.log("shit happened in getCommittee");
			return null;
		},
		
		getSubcommittee: function (subcommittee) {
			if (subcommittee) return "True";
			if (subcommittee === false) return "False";
			return "NA";
		},
		
		handleFavButtonClick: function (committee_id) {
			if (scope.isFavorited('committee', committee_id))
				scope.removeFromFavorites('committee', committee_id);
			else
				scope.addToFavorites('committee', committee_id, scope.committees.getCommittee(committee_id));
			scope.committees_favorites_star = scope.committees_favorites_star + 1;
		},
	};

	scope.favorites = {
		favorites_view_details: function (id, entity) {
			switch (entity) {
				case 'legislator':
					scope.legislators.legislator_view_details(id);
					break;
				case 'bill':
					scope.bills.bill_view_details(id);
					break;
				default:
					console.log("someshit happened in favorites_view_details")
					break;
			}
		}
	};

	scope.isFavorited = function (entity, id) {
		switch (entity) {
			case 'legislator':
				for (var i = 0; i < localStorage.legislators_favorite.length; i++) {
					if (localStorage.legislators_favorite[i].bioguide_id === id)
						return true;
				}
				return false;
				break;
			case 'bill':
				for (var i = 0; i < localStorage.bills_favorite.length; i++) {
					if (localStorage.bills_favorite[i].bill_id === id)
						return true;
				}
				return false;
				break;
			case 'committee':
				for (var i = 0; i < localStorage.committees_favorite.length; i++) {
					if (localStorage.committees_favorite[i].committee_id === id)
						return true;
				}
				return false;
				break;
			default:
				console.log("shit happened in addToFavorites");
				return false;
		}
	}

	scope.addToFavorites = function (entity, id, item) {
		if (!scope.isFavorited(entity, id)) {
			switch (entity) {
				case 'legislator':
					localStorage.legislators_favorite.push(item);
					break;
				case 'bill':
					localStorage.bills_favorite.push(item);
					break;
				case 'committee':
					localStorage.committees_favorite.push(item);
					break;
				default:
					console.log("shit happened in addToFavorites");
			}
		}
		scope.other_favorite_stars++;
	};

	scope.removeFromFavorites = function (entity, id) {
		switch (entity) {
			case 'legislator':
				localStorage.legislators_favorite = localStorage.legislators_favorite.filter(function (legislator) {
					return legislator.bioguide_id !== id;
				});
				break;
			case 'bill':
				localStorage.bills_favorite = localStorage.bills_favorite.filter(function (bill) {
					return bill.bill_id !== id;
				});
				break;
			case 'committee':
				localStorage.committees_favorite = localStorage.committees_favorite.filter(function (committee) {
					return committee.committee_id !== id;
				});
				break;
			default:
				console.log("shit happened in addToFavorites");
		}
		scope.other_favorite_stars++;
	};
}])
