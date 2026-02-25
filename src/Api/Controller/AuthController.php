<?php

namespace Datlechin\TagPasswords\Api\Controller;

use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Tags\TagRepository;
use Flarum\User\User;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AuthController implements RequestHandlerInterface
{
    public function __construct(protected TagRepository $tags) {}

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $actor = RequestUtil::getActor($request);
        $data = Arr::get($request->getParsedBody(), 'data', []);

        $tag = $this->tags->findOrFail($data['id'], $actor);

        if ($tag->password && $tag->password !== ($data['password'] ?? '')) {
            throw new ValidationException(['password' => 'Password is incorrect']);
        }

        if ($tag->protected_groups) {
            if (! $this->hasGroup($actor, json_decode($tag->protected_groups, true))) {
                throw new ValidationException(['group' => 'Access Denied for Tag Access "' . $tag->name . '".']);
            }
        }

        if (! $actor->isGuest()) {
            $state = $tag->stateFor($actor);
            $state->is_unlocked = true;
            $state->save();
        }

        return new JsonResponse(['success' => true]);
    }

    protected function hasGroup(User $actor, array $protectedGroups): bool
    {
        $protectedGroupIds = array_column($protectedGroups, 'id');

        foreach ($actor->groups as $group) {
            if (in_array((int) $group->id, $protectedGroupIds, true)) {
                return true;
            }
        }

        return false;
    }
}
