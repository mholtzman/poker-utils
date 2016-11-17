'use strict';

const chai = require('chai');
chai.should();

const hands = require('./hand-ranks');

describe('card()', function() {
    it('should return a card for a valid string value', function() {
        let card = hands.card('2h');

        card.rank.should.equal(2);
        card.suit.should.equal('h');
    });

    it('should throw an error for a card with an invalid rank', function() {
        (() => hands.card('21s')).should.throw(Error);
    });

    it('should throw an error for a card with an invalid suit', function() {
        (() => hands.card('2g')).should.throw(Error);
    });
});

describe('hand()', function() {
    it('should throw an error for an empty hand', function() {
        (() => hands.hand([])).should.throw(Error);
    });

    it('should throw an error for an invalid hand', function() {
        let hand = ['4s', '8h', 'ac', '3d'];
        (() => hands.hand(hand)).should.throw(Error);
    });

    it('should return a hand for a valid hand combination', function() {
        let handCards = ['4s', '8h', 'Ac', '3d', 'Ts'];

        const hand = hands.hand(handCards);

        hand.should.have.length(5);
    });
});

describe('rankHand()', function() {
    const checkInOrder = handCards => {
        for (let i = 0; i < handCards.length - 1; i++) {
            handCards[i].rank.should.be.at.least(handCards[i + 1].rank);
        }
    };

    it('should return a non-paired hand in order, with a ranking of high card', function() {
        const hand = hands.hand(['8s', '2h', '7c', 'Ad', '4c']);

        const rankedHand = hands.rankHand(hand);

        // cards should be ordered from highest to lowest
        rankedHand.rank.should.equal('high card');
        checkInOrder(rankedHand.handCards);
    });

    it('should return a hand with a pair at the front', function() {
        const hand = hands.hand(['4s', '8h', 'Qc', '8d', 'Ts']);

        const rankedHand = hands.rankHand(hand);

        // pair should be be in front of higher cards
        rankedHand.rank.should.equal('one pair');
        rankedHand.handCards[0].rank.should.equal(rankedHand.handCards[1].rank);
        checkInOrder(rankedHand.handCards.slice(2));
    });

    it('should return a hand with two pairs in order', function() {
        const hand = hands.hand(['4s', 'Ah', '8c', '4d', '8s']);

        const rankedHand = hands.rankHand(hand);
        
        // both pair should be be in front of higher cards
        rankedHand.rank.should.equal('two pair');
        rankedHand.handCards[0].rank.should.equal(rankedHand.handCards[1].rank);
        rankedHand.handCards[2].rank.should.equal(rankedHand.handCards[3].rank);
    });

    it('should return a hand with three of a kind at the front', function() {
        const hand = hands.hand(['8s', 'Ah', '8c', 'Jd', '8s']);

        const rankedHand = hands.rankHand(hand);

        // three of a kind should be be in front of higher cards
        rankedHand.rank.should.equal('three of a kind');
        rankedHand.handCards[0].rank.should.equal(rankedHand.handCards[1].rank);
        rankedHand.handCards[1].rank.should.equal(rankedHand.handCards[2].rank);
        checkInOrder(rankedHand.handCards.slice(3));
    });

    it('should return a full house with three of a kind followed by a pair', function() {
        const hand = hands.hand(['8s', 'Ah', '8c', 'Ad', '8s']);

        const rankedHand = hands.rankHand(hand);

        // three of a kind should be in front, then the pair
        rankedHand.rank.should.equal('full house');
        rankedHand.handCards[0].rank.should.equal(rankedHand.handCards[1].rank);
        rankedHand.handCards[1].rank.should.equal(rankedHand.handCards[2].rank);
        rankedHand.handCards[3].rank.should.equal(rankedHand.handCards[4].rank);
    });

    it('should return a hand with four of a kind at the front', function() {
        const hand = hands.hand(['8s', 'Ah', '8c', '8d', '8s']);

        const rankedHand = hands.rankHand(hand);

        // four of a kind should be be in front of higher card
        rankedHand.rank.should.equal('four of a kind');
        rankedHand.handCards[0].rank.should.equal(rankedHand.handCards[1].rank);
        rankedHand.handCards[1].rank.should.equal(rankedHand.handCards[2].rank);
        rankedHand.handCards[2].rank.should.equal(rankedHand.handCards[3].rank);
    });

    it('should return a straight in order', function() {
        const hand = hands.hand(['8s', '4h', '6c', '5s', '7s']);

        const rankedHand = hands.rankHand(hand);

        // cards should be ordered from highest to lowest
        rankedHand.rank.should.equal('straight');
        checkInOrder(rankedHand);
    });

    it('should return a flush in order', function() {
        const hand = hands.hand(['8s', 'Qs', '6s', 'Ts', 'As']);

        const rankedHand = hands.rankHand(hand);

        // cards should be ordered from highest to lowest
        rankedHand.rank.should.equal('flush');
        checkInOrder(rankedHand);
    });

    it('should return a straight flush in order', function() {
        const hand = hands.hand(['8s', '4s', '6s', '5s', '7s']);

        const rankedHand = hands.rankHand(hand);

        // cards should be ordered from highest to lowest
        rankedHand.rank.should.equal('straight flush');
        checkInOrder(rankedHand);
    });
});

describe('compareHands()', function() {
    describe('#with different ranks', function() {
        it('should consider one pair stronger than high card', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Qs', '6c', 'Ts', 'As']));
            const hand2 = hands.rankHand(hands.hand(['2s', 'Qh', '6d', '2s', 'As']));

            hands.compare(hand1, hand2).should.be.below(0);
        });

        it('should consider two pair stronger than one pair', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Qs', 'Qc', '8d', 'As']));
            const hand2 = hands.rankHand(hands.hand(['2s', 'Qh', '6d', '2s', 'As']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider three of a kind stronger than two pair', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Qs', 'Qc', '8d', 'As']));
            const hand2 = hands.rankHand(hands.hand(['Qc', 'Qh', '6d', '2s', 'Qs']));

            hands.compare(hand1, hand2).should.be.below(0);
        });

        it('should consider a straight stronger than three of a kind', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Js', '9c', '7d', 'Ts']));
            const hand2 = hands.rankHand(hands.hand(['Qc', 'Qh', '6d', '2s', 'Qs']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider a flush stronger than a straight', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Js', '9c', '7d', 'Ts']));
            const hand2 = hands.rankHand(hands.hand(['Qc', '4c', '2c', '7c', 'Kc']));

            hands.compare(hand1, hand2).should.be.below(0);
        });

        it('should consider a full house stronger than a flush', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Js', 'Jc', 'Jd', '8d']));
            const hand2 = hands.rankHand(hands.hand(['Qc', '4c', '2c', '7c', 'Kc']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider four of a kind stronger than a full house', function() {
            const hand1 = hands.rankHand(hands.hand(['8s', 'Js', 'Jc', 'Jd', '8d']));
            const hand2 = hands.rankHand(hands.hand(['6c', '6h', '6d', '2s', '6s']));

            hands.compare(hand1, hand2).should.be.below(0);
        });

        it('should consider a straight flush stronger than four of a kind', function() {
            const hand1 = hands.rankHand(hands.hand(['4s', '3s', '6s', '7s', '5s']));
            const hand2 = hands.rankHand(hands.hand(['6c', '6h', '6d', '2s', '6s']));

            hands.compare(hand1, hand2).should.be.above(0);
        });
    });
    
    describe('#within the same rank', function() {
        it('should consider the highest card when comparing two high card hands', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '3c', '6s', '9d', 'Qd']));
            const hand2 = hands.rankHand(hands.hand(['9c', 'Jc', '4s', 'Td', '8d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should check all cards in a high card hand when the highest card(s) are the same', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '8c', '6s', '9d', 'Qd']));
            const hand2 = hands.rankHand(hands.hand(['9c', 'Qc', '4s', '5d', '8d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the higher pair when comparing two paired hands', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '8c', '6s', '8d', 'Qd']));
            const hand2 = hands.rankHand(hands.hand(['7c', 'Qc', '4s', '7d', '8d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the kicker(s) when comparing two paired hands with a pair of the same rank', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '8c', 'Js', '8d', 'Kd']));
            const hand2 = hands.rankHand(hands.hand(['8c', 'Tc', 'Ks', '8d', '4d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the higher pair first when comparing hands that have two pair', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '8c', 'Js', '8d', 'Jd']));
            const hand2 = hands.rankHand(hands.hand(['8c', 'Tc', 'Ts', '8d', '4d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the second pair when comparing hands that have two pair and the top pair is the same rank', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '8c', 'Js', '8d', 'Jd']));
            const hand2 = hands.rankHand(hands.hand(['7c', 'Jc', 'Js', '7d', '4d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the kicker when comparing hands with the same two pair', function() {
            const hand1 = hands.rankHand(hands.hand(['5c', '8c', 'Js', '8d', 'Jd']));
            const hand2 = hands.rankHand(hands.hand(['8c', 'Jc', 'Js', '8d', '4d']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider two pair with the same kicker as equal', function() {
            const hand1 = hands.rankHand(hands.hand(['5c', '8c', 'Js', '8d', 'Jd']));
            const hand2 = hands.rankHand(hands.hand(['8c', 'Jc', 'Js', '8d', '5d']));

            hands.compare(hand1, hand2).should.equal(0);
        });

        it('should consider the higher set when comparing hands with three of a kind', function() {
            const hand1 = hands.rankHand(hands.hand(['4c', '6c', '6s', '6d', 'Jd']));
            const hand2 = hands.rankHand(hands.hand(['5c', 'Jc', '5s', '7d', '5h']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the kicker(s) when comparing hands with three of a kind', function() {
            const hand1 = hands.rankHand(hands.hand(['Ac', '6c', '6s', '6d', 'Qd']));
            const hand2 = hands.rankHand(hands.hand(['6c', 'Jc', '6s', 'Ad', '6h']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the three of a kind first when comparing two full houses', function() {
            const hand1 = hands.rankHand(hands.hand(['Ks', 'Kc', 'Jc', 'Jd', 'Kh']));
            const hand2 = hands.rankHand(hands.hand(['Qs', 'Jc', 'Qc', 'Jd', 'Qh']));

            hands.compare(hand1, hand2).should.be.above(0);
        });

        it('should consider the pair second when comparing two full houses', function() {
            const hand1 = hands.rankHand(hands.hand(['Ks', 'Kc', 'Jc', 'Jd', 'Kh']));
            const hand2 = hands.rankHand(hands.hand(['Ts', 'Kc', 'Kc', 'Kd', 'Th']));

            hands.compare(hand1, hand2).should.be.above(0);
        });
    });
});