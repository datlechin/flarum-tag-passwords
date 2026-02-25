<?php

namespace Datlechin\TagPasswords\Policy;

use Datlechin\TagPasswords\TagProtectionChecker;
use Flarum\Discussion\Discussion;
use Flarum\User\Access\AbstractPolicy;
use Flarum\User\User;

class DiscussionPolicy extends AbstractPolicy
{
    public function isDiscussionUnlocked(User $actor, Discussion $discussion): bool
    {
        $result = TagProtectionChecker::getProtectedTags($discussion, $actor);

        return ! $result['isProtected'];
    }
}
