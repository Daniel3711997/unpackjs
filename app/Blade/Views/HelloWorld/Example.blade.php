<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<h1>{{$HelloWorldVersion}}</h1>

<?php

do_shortcode('[framework-app id="rootProfile" echo="true"]');
