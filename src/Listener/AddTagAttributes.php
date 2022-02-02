<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Tags\Tag;

class AddTagAttributes
{
    /**
     * @param TagSerializer $serializer
     * @param Tag $tag
     * @param array $attributes
     * @return array
     */
    public function __invoke(TagSerializer $serializer, Tag $tag, array $attributes): array
    {
        $actor = $serializer->getActor();

        $state = $tag->stateFor($actor);

        $attributes['isPasswordProtected'] = (bool) $tag->password;
        $attributes['isUnlocked'] = (bool) $state->is_unlocked;
        if ($actor->isAdmin()) {
            $attributes['password'] = $tag->password;
        }

        return $attributes;
    }
}
