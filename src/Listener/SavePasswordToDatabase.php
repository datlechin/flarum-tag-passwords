<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Tags\Event\Saving;
use Illuminate\Support\Arr;

class SavePasswordToDatabase
{
    public function handle(Saving $event)
    {
        $tag = $event->tag;
        $data = $event->data;
        $attributes = Arr::get($data, 'attributes', []);

        $tag->password = Arr::get($attributes, 'password', null);
        $tag->protected_groups = Arr::get($attributes, 'protected_groups', null);
    }
}
