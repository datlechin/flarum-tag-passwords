<?php

namespace Datlechin\TagPasswords\Policy;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class TagPolicy extends AbstractPolicy
{
    public function __construct(protected SettingsRepositoryInterface $settings) {}

    public function isTagUnlocked(User $actor, Tag $tag): bool
    {
        $isPasswordProtected = (bool) $tag->password;
        $isGroupProtected = (bool) $tag->protected_groups;

        // Avoid checking for is_unlock all the time
        if ($isPasswordProtected || $isGroupProtected) {
            $state = $tag->stateFor($actor);

            return (bool) $state->is_unlocked;
        }

        return true;
    }
}
