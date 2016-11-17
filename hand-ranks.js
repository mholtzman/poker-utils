'use strict';

const SUITS = ['c', 'd', 'h', 's'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const HAND_RANKS = [ 'high card', 'one pair', 'two pair', 'three of a kind', 'straight', 'flush', 'full house', 'four of a kind', 'straight flush' ];

// add to rank to make values consistent with numbers
const rankForValue = value => RANKS.indexOf(value) + 2;
const handRanking = rankName => ({ rank: rankName, value: HAND_RANKS.indexOf(rankName) });
const descendingByRank = (a, b) => b.rank - a.rank;
const descendingWithGroups = (a, b) => (b.length - a.length) || descendingByRank(a[0], b[0]);
const concat = (prev, arr) => prev.concat(arr);
const flatten = hand => hand.reduce(concat, []);

// assumed that hand is sorted in descending order and has no duplicates
const isStraight = hand => hand[0].rank - hand[hand.length - 1].rank === hand.length - 1;
const sameSuit = (suit, card) => card.suit === suit;
const isSuited = hand => hand.slice(1).every(sameSuit.bind(null, hand[0].suit));

const groupHand = hand => hand.slice().reduce(groupCards, []).sort(descendingWithGroups);
const groupCards = function(prevHand, card) {
    for (let i = 0; i < prevHand.length; i++) {
        let cardGroup = prevHand[i];
        if (cardGroup[0].rank === card.rank) {
            cardGroup.push(card);
            return prevHand;
        }
    }

    prevHand.push([card]);
    return prevHand;
};

const card = exports.card = function(strValue) {
    const splitPoint = strValue.length - 1;
    let [rank, suit] = [rankForValue(strValue.substring(0, splitPoint)), strValue.charAt(splitPoint).toLowerCase()];
    
    if (rank < 2) {
        throw Error(`invalid rank specified: ${strValue}`);
    }

    if (SUITS.indexOf(suit) < 0) {
        throw Error(`invalid suit specified: ${strValue}`);
    }

    return { rank, suit };
};

const hand = exports.hand = function(cardStrs) {
    if (!cardStrs || cardStrs.length !== 5) {
        throw Error('hands must contain exactly five cards');
    }

    return cardStrs.map(card);
};

const rankHand = exports.rankHand = function(handCards) {
    let rankedHand;
    let groupedHandCards = groupHand(handCards);
    let firstGroupLength = groupedHandCards[0].length;
    let secondGroupLength = groupedHandCards[1].length;

    if (firstGroupLength === 4) {
        rankedHand = handRanking('four of a kind');
    } else if (firstGroupLength === 3) {
        rankedHand = (secondGroupLength === 2) ? handRanking('full house') : handRanking('three of a kind');
    } else if (firstGroupLength === 2) {
        rankedHand = (secondGroupLength === 2) ? handRanking('two pair') : handRanking('one pair');
    } else {
        // no paired cards, test for straights and flushes
        let singleCards = groupedHandCards.map(cardGroup => cardGroup[0]);
        let flush = isSuited(singleCards);
        let straight = isStraight(singleCards);

        if (flush) {
            rankedHand = straight ? handRanking('straight flush') : handRanking('flush');
        } else {
            rankedHand = straight ? handRanking('straight') : handRanking('high card');
        }
    }

    return Object.assign({ handCards: flatten(groupedHandCards) }, rankedHand);
};

// first compare by hand strength, then by cards within each type of hand
const compareCards = (c1, c2) => c1.length > 0 ? ((c1[0].rank - c2[0].rank) || compareCards(c1.slice(1), c2.slice(1))) : 0;
const compareHands = exports.compare = (h1, h2) => (h1.value - h2.value) || compareCards(h1.handCards, h2.handCards);