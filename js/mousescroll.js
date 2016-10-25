/**
 * Created by Z003EUNW on 10/25/2016.
 */
$('.selector ul li').click( function() {
    $('.selector ul li').removeClass('selected');
    $(this).addClass('selected');
});
$(document).ready(function () {
    $('.selector').mousewheel(function(e, delta) {
        this.scrollLeft -= (delta * 70);
        e.preventDefault();
    });

});
