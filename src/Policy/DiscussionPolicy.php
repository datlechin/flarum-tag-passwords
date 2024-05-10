<?php

namespace Datlechin\TagPasswords\Policy;

use Flarum\Discussion\Discussion;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class DiscussionPolicy extends AbstractPolicy
{
    public function __construct(protected SettingsRepositoryInterface $settings) {}

    public function isDiscussionUnlocked(User $actor, Discussion $discussion)
    {
        $tags = $discussion->tags;

        foreach ($tags as &$tag) {
            $isPasswordProtected = (bool) $tag->password;
            $isGroupPermissionProtected = (bool) $tag->protected_groups;

            if ($isPasswordProtected || $isGroupPermissionProtected) {
                $state = $tag->stateFor($actor);
                $isUnlocked = (bool) $state->is_unlocked;

                if (! $isUnlocked) {
                    return false;
                }
            }
        }

        return true;
    }
}
