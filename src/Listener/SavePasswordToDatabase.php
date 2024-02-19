<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Tags\Event\Saving;
use Illuminate\Support\Arr;

class SavePasswordToDatabase
{
    /**
     * @param Saving $event
     */
    public function handle(Saving $event)
    {
        $tag = $event->tag;
        $data = $event->data;
        $attributes = Arr::get($data, 'attributes', []);

        $tag->password = Arr::get($attributes, 'password', null);
        $tag->protected_group_ids = Arr::get($attributes, 'protected_group_ids', null);
    }
}
